from __future__ import annotations

import asyncio
import json
import os
import random
import sqlite3
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(env_file: Path, override: bool = False) -> None:
        """Load simple KEY=VALUE settings when python-dotenv is unavailable."""
        try:
            lines = env_file.read_text(encoding="utf-8").splitlines()
        except OSError:
            return
        for line in lines:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key, value = key.strip(), value.strip()
            if value[:1] == value[-1:] and value.startswith(("'", '"')):
                value = value[1:-1]
            if key and (override or key not in os.environ):
                os.environ[key] = value

APP_NAME = "SheFarms Virtual Soil Sensor"
PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_ROOT / ".env"
load_dotenv(ENV_FILE, override=False)

_db_setting = Path(os.getenv("SOIL_SENSOR_DB", "data/soil_sensor.sqlite3")).expanduser()
DB_PATH = (_db_setting if _db_setting.is_absolute() else PROJECT_ROOT / _db_setting).resolve()
DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("SOIL_SENSOR_CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
    if origin.strip()
]

FIELDS = {
    "ph": (0.0, 14.0),
    "moisture": (0.0, 100.0),
    "temperature": (-10.0, 60.0),
    "nitrogen": (0.0, 300.0),
    "phosphorus": (0.0, 200.0),
    "potassium": (0.0, 400.0),
    "organic_matter": (0.0, 20.0),
}

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with db() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS sensor_config (
            sensor_id TEXT PRIMARY KEY,
            sensor_name TEXT NOT NULL,
            field_name TEXT NOT NULL,
            plot_name TEXT NOT NULL,
            interval_seconds INTEGER NOT NULL,
            mode TEXT NOT NULL,
            ranges_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )""")
        conn.execute("""
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            sensor_id TEXT NOT NULL,
            field_name TEXT NOT NULL,
            plot_name TEXT NOT NULL,
            ph REAL NOT NULL,
            moisture REAL NOT NULL,
            temperature REAL NOT NULL,
            nitrogen REAL NOT NULL,
            phosphorus REAL NOT NULL,
            potassium REAL NOT NULL,
            organic_matter REAL NOT NULL,
            source TEXT NOT NULL CHECK(source IN ('simulated','manual'))
        )""")

        conn.execute("""
        CREATE TABLE IF NOT EXISTS calendar_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            event_type TEXT NOT NULL CHECK(event_type IN ('task','activity','sensor_run')),
            start_at TEXT NOT NULL,
            end_at TEXT,
            location TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'planned',
            sensor_id TEXT,
            field_name TEXT,
            plot_name TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            execution_error TEXT,
            reading_id INTEGER,
            FOREIGN KEY(reading_id) REFERENCES readings(id)
        )""")
        row = conn.execute("SELECT sensor_id FROM sensor_config LIMIT 1").fetchone()
        if not row:
            sensor_id = "virtual-sensor-01"
            default_ranges = {
                "ph": [5.5, 7.5], "moisture": [25, 65],
                "temperature": [15, 32], "nitrogen": [20, 100],
                "phosphorus": [10, 60], "potassium": [80, 220],
                "organic_matter": [1, 6]
            }
            conn.execute("""INSERT INTO sensor_config VALUES (?,?,?,?,?,?,?,?)""", (
                sensor_id, "Virtual Soil Sensor 01", "Demo Field", "Plot A",
                30, "manual", json.dumps(default_ranges), now_iso()
            ))

class RangePair(BaseModel):
    model_config = ConfigDict(extra="forbid")
    minimum: float
    maximum: float

class SensorConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sensor_id: str = Field(default="virtual-sensor-01", min_length=1, max_length=80)
    sensor_name: str = Field(default="Virtual Soil Sensor 01", min_length=1, max_length=100)
    field_name: str = Field(default="Demo Field", min_length=1, max_length=100)
    plot_name: str = Field(default="Plot A", min_length=1, max_length=100)
    interval_seconds: int = Field(default=30, ge=5, le=86400)
    ranges: dict[str, RangePair] | None = None

class ManualReading(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sensor_id: str = Field(default="virtual-sensor-01", min_length=1, max_length=80)
    ph: float = Field(ge=0, le=14)
    moisture: float = Field(ge=0, le=100)
    temperature: float = Field(ge=-10, le=60)
    nitrogen: float = Field(ge=0, le=300)
    phosphorus: float = Field(ge=0, le=200)
    potassium: float = Field(ge=0, le=400)
    organic_matter: float = Field(ge=0, le=20)

class SimulationStart(BaseModel):
    interval_seconds: int | None = Field(default=None, ge=5, le=86400)

class Simulator:
    def __init__(self):
        self.task: asyncio.Task | None = None
        self.running = False

    def config(self, sensor_id: str | None = None):
        with db() as conn:
            if sensor_id:
                row = conn.execute("SELECT * FROM sensor_config WHERE sensor_id=?", (sensor_id,)).fetchone()
            else:
                row = conn.execute("SELECT * FROM sensor_config LIMIT 1").fetchone()
        return dict(row) if row else None

    def public_config(self, row):
        if not row:
            return None
        return {
            "sensor_id": row["sensor_id"], "sensor_name": row["sensor_name"],
            "field_name": row["field_name"], "plot_name": row["plot_name"],
            "interval_seconds": row["interval_seconds"], "mode": row["mode"],
            "ranges": json.loads(row["ranges_json"]), "updated_at": row["updated_at"],
            "is_simulated_system": True
        }

    def save(self, values: dict, source: str, sensor_id: str):
        cfg = self.config(sensor_id)
        if not cfg:
            raise HTTPException(404, f"Unknown sensor_id: {sensor_id}")
        payload = {k: float(values[k]) for k in FIELDS}
        with db() as conn:
            cur = conn.execute("""
            INSERT INTO readings (
                timestamp,sensor_id,field_name,plot_name,ph,moisture,temperature,
                nitrogen,phosphorus,potassium,organic_matter,source
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""", (
                now_iso(), sensor_id, cfg["field_name"], cfg["plot_name"],
                payload["ph"], payload["moisture"], payload["temperature"],
                payload["nitrogen"], payload["phosphorus"], payload["potassium"],
                payload["organic_matter"], source
            ))
            row = conn.execute("SELECT * FROM readings WHERE id=?", (cur.lastrowid,)).fetchone()
        return dict(row)

    def generate(self, sensor_id: str):
        cfg = self.config(sensor_id)
        if not cfg:
            raise HTTPException(404, f"Unknown sensor_id: {sensor_id}")
        ranges = json.loads(cfg["ranges_json"])
        with db() as conn:
            previous = conn.execute(
                "SELECT " + ",".join(FIELDS.keys()) +
                " FROM readings WHERE sensor_id=? ORDER BY id DESC LIMIT 1",
                (sensor_id,),
            ).fetchone()

        values = {}
        for key, (hard_min, hard_max) in FIELDS.items():
            low, high = ranges[key]
            # First sample starts at the midpoint. Later samples move by at most
            # 8% of the configured span per cycle (bounded random walk).
            if previous is None:
                next_value = (low + high) / 2
            else:
                current = min(high, max(low, float(previous[key])))
                max_step = max((high - low) * 0.08, 0.01)
                next_value = current + random.uniform(-max_step, max_step)
            values[key] = round(min(high, max(low, next_value)), 2)
        return self.save(values, "simulated", sensor_id)

simulator = Simulator()
calendar_task: asyncio.Task | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global calendar_task
    init_db()
    with db() as conn:
        conn.execute(
            """UPDATE calendar_events
               SET status='failed', execution_error='Simulator was offline at the scheduled time. Retry when the service is online.', updated_at=?
               WHERE event_type='sensor_run' AND status='planned' AND start_at <= ?""",
            (now_iso(), now_iso()),
        )
    calendar_task = asyncio.create_task(calendar_scheduler())
    try:
        yield
    finally:
        if calendar_task and not calendar_task.done():
            calendar_task.cancel()
            try:
                await calendar_task
            except asyncio.CancelledError:
                pass
        calendar_task = None
    if simulator.task and not simulator.task.done():
        simulator.task.cancel()
        try:
            await simulator.task
        except asyncio.CancelledError:
            pass

app = FastAPI(title=APP_NAME, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CalendarEventInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=1, max_length=160)
    description: str = Field(default="", max_length=4000)
    event_type: Literal["task", "activity", "sensor_run"] = "task"
    start_at: datetime
    end_at: datetime | None = None
    location: str = Field(default="", max_length=240)
    status: Literal["planned", "in_progress", "done", "cancelled"] = "planned"
    sensor_id: str | None = None
    field_name: str | None = None
    plot_name: str | None = None

def event_dict(row):
    return dict(row)

def get_event(event_id: int):
    with db() as conn:
        row = conn.execute("SELECT * FROM calendar_events WHERE id=?", (event_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Calendar event not found")
    return event_dict(row)

async def calendar_scheduler():
    """Persistent one-shot job runner. Events stay in SQLite; missed jobs fail visibly."""
    while True:
        due = []
        with db() as conn:
            rows = conn.execute("""
                SELECT * FROM calendar_events
                WHERE event_type='sensor_run' AND status='planned' AND start_at <= ?
                ORDER BY start_at ASC LIMIT 20
            """, (now_iso(),)).fetchall()
            for row in rows:
                conn.execute("UPDATE calendar_events SET status='in_progress',updated_at=? WHERE id=? AND status='planned'",
                             (now_iso(), row["id"]))
                due.append(dict(row))
        for event in due:
            try:
                sensor_id = event["sensor_id"] or "virtual-sensor-01"
                cfg = simulator.config(sensor_id)
                if not cfg:
                    raise RuntimeError(f"Virtual sensor '{sensor_id}' is not configured")
                reading = simulator.generate(sensor_id)
                with db() as conn:
                    conn.execute("""UPDATE calendar_events
                        SET status='completed',reading_id=?,execution_error=NULL,updated_at=?
                        WHERE id=?""", (reading["id"], now_iso(), event["id"]))
            except Exception as exc:
                with db() as conn:
                    conn.execute("""UPDATE calendar_events
                        SET status='failed',execution_error=?,updated_at=? WHERE id=?""",
                        (str(exc)[:1000], now_iso(), event["id"]))
        await asyncio.sleep(2)

@app.get("/calendar/events")
def list_calendar_events(
    start: datetime | None = None,
    end: datetime | None = None,
    event_type: Literal["task", "activity", "sensor_run"] | None = None
):
    sql = "SELECT * FROM calendar_events WHERE 1=1"
    params = []
    if start:
        sql += " AND start_at >= ?"; params.append(start.isoformat())
    if end:
        sql += " AND start_at <= ?"; params.append(end.isoformat())
    if event_type:
        sql += " AND event_type = ?"; params.append(event_type)
    sql += " ORDER BY start_at ASC"
    with db() as conn:
        rows = conn.execute(sql, params).fetchall()
    return {"items": [event_dict(r) for r in rows]}

@app.post("/calendar/events", status_code=201)
def create_calendar_event(payload: CalendarEventInput):
    if payload.end_at and payload.end_at < payload.start_at:
        raise HTTPException(422, "end_at must be at or after start_at")
    if payload.event_type == "sensor_run":
        sensor_id = payload.sensor_id or "virtual-sensor-01"
        if not simulator.config(sensor_id):
            raise HTTPException(404, f"Unknown virtual sensor_id: {sensor_id}")
        if payload.status not in ("planned", "cancelled"):
            raise HTTPException(422, "A scheduled sensor run must start as planned or cancelled")
    else:
        sensor_id = payload.sensor_id
    stamp = now_iso()
    with db() as conn:
        cur = conn.execute("""INSERT INTO calendar_events
            (title,description,event_type,start_at,end_at,location,status,sensor_id,
             field_name,plot_name,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""", (
            payload.title, payload.description, payload.event_type,
            payload.start_at.isoformat(), payload.end_at.isoformat() if payload.end_at else None,
            payload.location, payload.status, sensor_id, payload.field_name,
            payload.plot_name, stamp, stamp
        ))
        event_id = cur.lastrowid
    return {"event": get_event(event_id)}

@app.get("/calendar/events/{event_id}")
def read_calendar_event(event_id: int):
    return {"event": get_event(event_id)}

@app.put("/calendar/events/{event_id}")
def update_calendar_event(event_id: int, payload: CalendarEventInput):
    current = get_event(event_id)
    if current["event_type"] == "sensor_run" and current["status"] in ("completed", "in_progress"):
        raise HTTPException(409, "Cannot edit a completed or currently executing sensor run")
    if payload.end_at and payload.end_at < payload.start_at:
        raise HTTPException(422, "end_at must be at or after start_at")
    sensor_id = payload.sensor_id or "virtual-sensor-01"
    if payload.event_type == "sensor_run" and not simulator.config(sensor_id):
        raise HTTPException(404, f"Unknown virtual sensor_id: {sensor_id}")
    with db() as conn:
        conn.execute("""UPDATE calendar_events SET title=?,description=?,event_type=?,
            start_at=?,end_at=?,location=?,status=?,sensor_id=?,field_name=?,plot_name=?,
            execution_error=NULL,updated_at=? WHERE id=?""", (
            payload.title, payload.description, payload.event_type,
            payload.start_at.isoformat(), payload.end_at.isoformat() if payload.end_at else None,
            payload.location, payload.status, sensor_id if payload.event_type == "sensor_run" else payload.sensor_id,
            payload.field_name, payload.plot_name, now_iso(), event_id
        ))
    return {"event": get_event(event_id)}

@app.delete("/calendar/events/{event_id}")
def delete_calendar_event(event_id: int):
    current = get_event(event_id)
    if current["event_type"] == "sensor_run" and current["status"] == "in_progress":
        raise HTTPException(409, "Cannot delete a sensor run while it is executing")
    with db() as conn:
        conn.execute("DELETE FROM calendar_events WHERE id=?", (event_id,))
    return {"deleted": True, "id": event_id}

@app.post("/calendar/events/{event_id}/retry")
def retry_sensor_run(event_id: int):
    event = get_event(event_id)
    if event["event_type"] != "sensor_run":
        raise HTTPException(409, "Only scheduled sensor runs can be retried")
    if event["status"] != "failed":
        raise HTTPException(409, f"Cannot retry event with status '{event['status']}'")
    if not simulator.config(event["sensor_id"] or "virtual-sensor-01"):
        raise HTTPException(404, "Configured virtual sensor is unavailable")
    with db() as conn:
        conn.execute("""UPDATE calendar_events SET status='planned',start_at=?,execution_error=NULL,
            reading_id=NULL,updated_at=? WHERE id=?""", (now_iso(), now_iso(), event_id))
    return {"event": get_event(event_id), "message": "Retry queued; it will run on the next scheduler cycle"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": APP_NAME,
        "readings_are_simulated": True,
        "database_path": str(DB_PATH),
        "cors_origins": CORS_ORIGINS,
    }

@app.get("/status")
def status():
    cfg = simulator.config()
    with db() as conn:
        count = conn.execute("SELECT COUNT(*) FROM readings").fetchone()[0]
        latest = conn.execute("SELECT timestamp,source FROM readings ORDER BY id DESC LIMIT 1").fetchone()
    return {
        "online": True, "simulation_running": simulator.running,
        "sensor": simulator.public_config(cfg), "reading_count": count,
        "latest_reading": dict(latest) if latest else None,
        "service_type": "virtual_simulator_not_physical_hardware"
    }

@app.get("/sensors")
def list_sensors():
    with db() as conn:
        rows = conn.execute("SELECT * FROM sensor_config ORDER BY sensor_id").fetchall()
    return {"items": [simulator.public_config(dict(r)) for r in rows]}

@app.put("/sensors/config")
def configure_sensor(payload: SensorConfig):
    current = simulator.config(payload.sensor_id)
    default_ranges = {
        "ph": [5.5, 7.5], "moisture": [25, 65], "temperature": [15, 32],
        "nitrogen": [20, 100], "phosphorus": [10, 60], "potassium": [80, 220],
        "organic_matter": [1, 6]
    }
    ranges = default_ranges
    if current:
        ranges = json.loads(current["ranges_json"])
    if payload.ranges is not None:
        for key, pair in payload.ranges.items():
            if key not in FIELDS:
                raise HTTPException(422, f"Unknown range field: {key}")
            hard_min, hard_max = FIELDS[key]
            if pair.minimum < hard_min or pair.maximum > hard_max or pair.minimum >= pair.maximum:
                raise HTTPException(422, f"Invalid range for {key}; expected {hard_min}..{hard_max} and min < max")
            ranges[key] = [pair.minimum, pair.maximum]
    with db() as conn:
        conn.execute("""INSERT INTO sensor_config VALUES (?,?,?,?,?,?,?,?)
        ON CONFLICT(sensor_id) DO UPDATE SET sensor_name=excluded.sensor_name,
        field_name=excluded.field_name,plot_name=excluded.plot_name,
        interval_seconds=excluded.interval_seconds,ranges_json=excluded.ranges_json,
        updated_at=excluded.updated_at""", (
            payload.sensor_id, payload.sensor_name, payload.field_name, payload.plot_name,
            payload.interval_seconds, "automatic" if simulator.running else "manual",
            json.dumps(ranges), now_iso()
        ))
    return {"sensor": simulator.public_config(simulator.config(payload.sensor_id))}

async def simulation_loop(sensor_id: str):
    try:
        while True:
            cfg = simulator.config(sensor_id)
            if not cfg:
                break
            simulator.generate(sensor_id)
            await asyncio.sleep(cfg["interval_seconds"])
    except asyncio.CancelledError:
        raise
    finally:
        simulator.running = False

@app.post("/simulation/start")
async def start_simulation(payload: SimulationStart | None = None):
    if simulator.running:
        return {"running": True, "message": "Simulation is already running"}
    cfg = simulator.config()
    if not cfg:
        raise HTTPException(404, "No configured virtual sensor")
    if payload and payload.interval_seconds:
        with db() as conn:
            conn.execute("UPDATE sensor_config SET interval_seconds=?,mode='automatic',updated_at=? WHERE sensor_id=?",
                         (payload.interval_seconds, now_iso(), cfg["sensor_id"]))
    else:
        with db() as conn:
            conn.execute("UPDATE sensor_config SET mode='automatic',updated_at=? WHERE sensor_id=?",
                         (now_iso(), cfg["sensor_id"]))
    simulator.running = True
    simulator.task = asyncio.create_task(simulation_loop(cfg["sensor_id"]))
    return {"running": True, "sensor_id": cfg["sensor_id"], "message": "Automatic simulated readings started"}

@app.post("/simulation/stop")
async def stop_simulation():
    if simulator.task and not simulator.task.done():
        simulator.task.cancel()
        try:
            await simulator.task
        except asyncio.CancelledError:
            pass
    simulator.running = False
    with db() as conn:
        conn.execute("UPDATE sensor_config SET mode='manual',updated_at=?", (now_iso(),))
    return {"running": False, "message": "Automatic simulation stopped"}

@app.post("/readings/manual", status_code=201)
def submit_manual_reading(payload: ManualReading):
    values = payload.model_dump(exclude={"sensor_id"})
    row = simulator.save(values, "manual", payload.sensor_id)
    return {"reading": row, "message": "Manual demonstration reading saved"}

@app.post("/readings/simulate", status_code=201)
def submit_generated_reading(sensor_id: str = "virtual-sensor-01"):
    return {"reading": simulator.generate(sensor_id)}

@app.get("/readings")
def recent_readings(
    sensor_id: str = "virtual-sensor-01",
    limit: int = Query(default=100, ge=1, le=1000),
    source: Literal["simulated", "manual"] | None = None
):
    sql = "SELECT * FROM readings WHERE sensor_id=?"
    params: list = [sensor_id]
    if source:
        sql += " AND source=?"
        params.append(source)
    sql += " ORDER BY id DESC LIMIT ?"
    params.append(limit)
    with db() as conn:
        rows = conn.execute(sql, params).fetchall()
    return {"items": [dict(r) for r in rows], "count": len(rows), "is_simulated_system": True}
