import os
import hashlib
import hmac
import re
import secrets
import sqlite3
import time
from datetime import date
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from PIL import Image, UnidentifiedImageError
except ImportError:
    Image = None
    UnidentifiedImageError = Exception

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None


app = FastAPI(title="SheFarms AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path(
    os.getenv("MODEL_PATH", str(Path(__file__).resolve().parent / "best.pt"))
).expanduser()
if not MODEL_PATH.is_absolute():
    MODEL_PATH = (Path(__file__).resolve().parent / MODEL_PATH).resolve()

model = None
model_error = None
AUTH_DB_PATH = Path(
    os.getenv("AUTH_DB_PATH", str(Path(__file__).resolve().parent / "shefarms.sqlite3"))
).expanduser()
PASSWORD_ITERATIONS = 310_000
SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7


class RegisterRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class TransportRequestCreate(BaseModel):
    pickup_location: str = Field(min_length=2, max_length=240)
    destination: str = Field(min_length=2, max_length=240)
    travel_date: str = Field(min_length=10, max_length=10)
    work_start: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    work_end: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    passengers: int = Field(default=1, ge=1, le=100)
    details: str = Field(default="", max_length=1200)


def connect_auth_db():
    connection = sqlite3.connect(AUTH_DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_auth_db():
    AUTH_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with connect_auth_db() as connection:
        connection.execute(
            """CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_salt BLOB NOT NULL,
                password_hash BLOB NOT NULL,
                created_at INTEGER NOT NULL
            )"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS auth_sessions (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at INTEGER NOT NULL
            )"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS transport_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                pickup_location TEXT NOT NULL,
                destination TEXT NOT NULL,
                travel_date TEXT NOT NULL,
                work_start TEXT NOT NULL,
                work_end TEXT NOT NULL,
                passengers INTEGER NOT NULL,
                details TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'pending',
                created_at INTEGER NOT NULL
            )"""
        )


def hash_password(password, salt=None):
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS
    )
    return salt, digest


def make_session(connection, user):
    token = secrets.token_urlsafe(32)
    expires_at = int(time.time()) + SESSION_LIFETIME_SECONDS
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    connection.execute(
        "INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
        (token_hash, user["id"], expires_at),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": SESSION_LIFETIME_SECONDS,
        "user": {
            "id": user["id"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "email": user["email"],
        },
    }


def load_model():
    global model, model_error

    if not MODEL_PATH.is_file():
        model_error = f"Model weights were not found: {MODEL_PATH}"
        return
    if YOLO is None:
        model_error = "Ultralytics is not installed. Install model/requirements.txt."
        return

    try:
        model = YOLO(str(MODEL_PATH))
        model_error = None
    except Exception as exc:
        model_error = f"Could not load model: {exc}"


load_model()
init_auth_db()


@app.get("/")
@app.get("/health")
def health():
    return {
        "status": "ok" if model is not None else "degraded",
        "api_ready": True,
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH),
        "model_error": model_error,
    }


@app.post("/auth/register", status_code=201)
def register(payload: RegisterRequest):
    email = payload.email.strip().lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise HTTPException(status_code=422, detail="Enter a valid email address")

    salt, password_hash = hash_password(payload.password)
    with connect_auth_db() as connection:
        existing = connection.execute(
            "SELECT id FROM users WHERE email = ?", (email,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="An account with this email already exists")

        cursor = connection.execute(
            """INSERT INTO users
               (first_name, last_name, email, password_salt, password_hash, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                payload.first_name.strip(),
                payload.last_name.strip(),
                email,
                salt,
                password_hash,
                int(time.time()),
            ),
        )
        user = connection.execute(
            "SELECT id, first_name, last_name, email FROM users WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
        return make_session(connection, user)


@app.post("/auth/login")
def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    with connect_auth_db() as connection:
        user = connection.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid email or password. Sign up first if this is a new account.")

        _, password_hash = hash_password(payload.password, user["password_salt"])
        if not hmac.compare_digest(password_hash, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        connection.execute("DELETE FROM auth_sessions WHERE expires_at <= ?", (int(time.time()),))
        return make_session(connection, user)


@app.get("/auth/me")
def current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sign in to continue")

    token = authorization.split(" ", 1)[1].strip()
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    with connect_auth_db() as connection:
        row = connection.execute(
            """SELECT users.id, users.first_name, users.last_name, users.email
               FROM auth_sessions JOIN users ON users.id = auth_sessions.user_id
               WHERE auth_sessions.token_hash = ? AND auth_sessions.expires_at > ?""",
            (token_hash, int(time.time())),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
        return dict(row)


def authenticated_user_id(authorization: str | None):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sign in to request transportation")
    token_hash = hashlib.sha256(authorization.split(" ", 1)[1].strip().encode("utf-8")).hexdigest()
    with connect_auth_db() as connection:
        row = connection.execute(
            "SELECT user_id FROM auth_sessions WHERE token_hash = ? AND expires_at > ?",
            (token_hash, int(time.time())),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    return row["user_id"]


@app.get("/transport/requests")
def list_transport_requests(authorization: str | None = Header(default=None)):
    user_id = authenticated_user_id(authorization)
    with connect_auth_db() as connection:
        rows = connection.execute(
            """SELECT id, pickup_location, destination, travel_date, work_start,
                      work_end, passengers, details, status, created_at
               FROM transport_requests WHERE user_id = ? ORDER BY travel_date DESC, id DESC""",
            (user_id,),
        ).fetchall()
    return {"items": [dict(row) for row in rows]}


@app.post("/transport/requests", status_code=201)
def create_transport_request(payload: TransportRequestCreate, authorization: str | None = Header(default=None)):
    user_id = authenticated_user_id(authorization)
    if payload.work_end <= payload.work_start:
        raise HTTPException(status_code=422, detail="Work end time must be later than the start time")
    try:
        date.fromisoformat(payload.travel_date)
    except ValueError:
        raise HTTPException(status_code=422, detail="Enter a valid travel date")
    with connect_auth_db() as connection:
        cursor = connection.execute(
            """INSERT INTO transport_requests
               (user_id, pickup_location, destination, travel_date, work_start, work_end,
                passengers, details, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, payload.pickup_location.strip(), payload.destination.strip(), payload.travel_date,
             payload.work_start, payload.work_end, payload.passengers, payload.details.strip(), int(time.time())),
        )
        row = connection.execute(
            """SELECT id, pickup_location, destination, travel_date, work_start,
                      work_end, passengers, details, status, created_at
               FROM transport_requests WHERE id = ?""", (cursor.lastrowid,),
        ).fetchone()
    return dict(row)


@app.delete("/transport/requests/{request_id}")
def cancel_transport_request(request_id: int, authorization: str | None = Header(default=None)):
    user_id = authenticated_user_id(authorization)
    with connect_auth_db() as connection:
        cursor = connection.execute(
            "UPDATE transport_requests SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status = 'pending'",
            (request_id, user_id),
        )
        if not cursor.rowcount:
            raise HTTPException(status_code=404, detail="Pending transport request not found")
    return {"id": request_id, "status": "cancelled"}


@app.post("/auth/logout")
def logout(authorization: str | None = Header(default=None)):
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        with connect_auth_db() as connection:
            connection.execute("DELETE FROM auth_sessions WHERE token_hash = ?", (token_hash,))
    return {"logged_out": True}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail=model_error or "AI model is unavailable")
    if Image is None:
        raise HTTPException(status_code=503, detail="Pillow is not installed")

    contents = await file.read()
    try:
        image = Image.open(BytesIO(contents)).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image")

    try:
        results = model(image, verbose=False)
        boxes = results[0].boxes
        detected_classes = [str(model.names[int(box.cls[0])]) for box in boxes]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {exc}")

    return {
        "filename": file.filename,
        "detected_classes": detected_classes,
        "num_detections": len(detected_classes),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "8000")),
    )
