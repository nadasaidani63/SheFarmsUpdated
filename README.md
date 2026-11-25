# SheFarms

SheFarms is a web platform for women farmers and rural agricultural cooperatives. It combines a React dashboard with two independent FastAPI services: account and crop-image analysis on port **8000**, and a virtual soil-sensor/calendar service on port **8001**. Vite serves the web client on port **5173** during development.

The soil sensor is a **software simulator**, not physical sensor hardware. Soil recommendations are threshold-based rules, not machine-learning predictions. Crop-image detections use the optional YOLO checkpoint described below.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Windows setup](#windows-setup)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Data and persistence](#data-and-persistence)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Security notes](#security-notes)

## Features

- **Dashboard:** overview, tasks, planning calendar, soil analysis, drone/IoT, financial and learning pages.
- **Accounts:** registration, login, hashed passwords, seven-day bearer-token sessions, and profile UI.
- **Crop-image AI:** upload an image for YOLO object detection when a compatible `model/best.pt` checkpoint and optional AI dependencies are available.
- **Virtual soil sensor:** configure a virtual probe, generate bounded gradual readings, add validated manual readings, and inspect reading history and threshold-based recommendations.
- **Calendar:** create, edit, delete and view tasks and activities; schedule virtual soil readings. Scheduled readings run only while the simulator service is online.
- **Transportation requests:** authenticated users can submit pickup/destination, travel date, work hours, passenger count, and notes; review their own requests and cancel pending ones. Requests are stored by the SheFarms backend for cooperative follow-up. Submission means **requested**, not confirmed or booked.
- **Responsive interface:** public pages and dashboard use the SheFarms Global Gathering visual direction.

## Architecture

```text
Browser (React 19 + Vite, :5173)
  ├── VITE_API_URL ───────────────► SheFarms FastAPI (model/main.py, :8000)
  │                                  ├── /auth/*       registration and sessions
  │                                  ├── /predict       YOLO crop-image inference
  │                                  └── /transport/*   authenticated ride requests
  └── VITE_SOIL_SENSOR_API_URL ───► Soil simulator FastAPI (soil_sensor/soil_simulator/main.py, :8001)
                                     ├── /sensors/*     virtual sensor configuration
                                     ├── /readings/*    simulated and manual soil readings
                                     └── /calendar/*    calendar events and scheduled runs
```

Key directories:

| Path | Purpose |
| --- | --- |
| `src/pages/` | Public site and profile pages |
| `src/auth/` | Sign-in, registration and password recovery screens |
| `src/dashboard/` | Dashboard shell, navigation, pages, API clients and styles |
| `model/main.py` | Auth, image inference and transport-request API |
| `model/requirements.txt` | Lightweight backend runtime dependencies |
| `model/requirements-ai.txt` | Optional Ultralytics inference dependencies |
| `model/train_model.py` | YOLO training entry point (dataset access is separate) |
| `soil_sensor/soil_simulator/main.py` | Virtual sensor and calendar API/scheduler |
| `soil_sensor/data/` | Runtime simulator database directory (database files are local) |
| `public/` | Static images and branding |

## Requirements

- Windows 10/11 or a recent macOS/Linux distribution.
- Node.js **18+** and npm.
- Python **3.10+** (Python 3.11 is a good default for ML library compatibility).
- Internet access for first-time dependency installation. Image-model training also requires access to a dataset and pretrained weights.
- A trained compatible YOLO checkpoint for crop-image analysis. The API and other features start without it, but `/predict` responds with HTTP 503 until a checkpoint and inference dependencies are available.

## Windows setup

Clone the repository and move into its root directory:

```powershell
git clone https://github.com/<OWNER>/<REPOSITORY>.git
cd <REPOSITORY>
```

Install frontend packages and configure the local API URLs:

```powershell
npm install
Copy-Item .env.example .env.local
```

### Terminal 1: virtual soil sensor and calendar API

```powershell
cd .\soil_sensor
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\start-soil-simulator.ps1
```

The simulator loads configuration from `soil_sensor/.env` (created from `.env.example` by its launcher if missing) and listens at `http://127.0.0.1:8001`.

### Terminal 2: SheFarms auth, crop-image and transport API

```powershell
cd ..\model
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe main.py
```

The backend listens at `http://127.0.0.1:8000`. To enable image inference, install the optional package set in a Python environment compatible with PyTorch/Ultralytics, then make a compatible checkpoint available at `model/best.pt` or set `MODEL_PATH`. See [`model/README.md`](model/README.md) for training and model setup notes.

### Terminal 3: React/Vite frontend

From the repository root:

```powershell
cd ..
npm run dev -- --host 127.0.0.1
```

Open **http://127.0.0.1:5173** and register an account. Keep all three service terminals running while using all connected features. For precise simulator setup, see [`SOIL_SENSOR_SETUP.md`](SOIL_SENSOR_SETUP.md).

### Service health and API documentation

| Service | Health | Interactive docs |
| --- | --- | --- |
| SheFarms backend | http://127.0.0.1:8000/health | http://127.0.0.1:8000/docs |
| Soil simulator | http://127.0.0.1:8001/health | http://127.0.0.1:8001/docs |
| Frontend | http://127.0.0.1:5173 | — |

## Configuration

The Vite app reads `.env.local` at its root. The repository includes `.env.example` as a starting point:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
VITE_SOIL_SENSOR_API_URL=/soil-api
```

The backend supports these environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Address for the SheFarms API server |
| `PORT` | `8000` | Port for the SheFarms API server |
| `MODEL_PATH` | `model/best.pt` | YOLO checkpoint path; relative paths resolve from `model/` |
| `AUTH_DB_PATH` | `model/shefarms.sqlite3` | SQLite database for users, sessions and transport requests |

During development, Vite proxies `/soil-api/*` to the simulator at `http://127.0.0.1:8001/*`, keeping browser requests same-origin. For a separately hosted frontend, set `VITE_SOIL_SENSOR_API_URL` to the deployed API URL and configure simulator CORS. The soil-simulator settings are documented in [`soil_sensor/README.md`](soil_sensor/README.md). Vite environment changes require restarting the dev server. Backend and simulator settings require restarting their service.

## API reference

All services expose interactive Swagger UI at `/docs` and OpenAPI JSON at `/openapi.json`.

### Accounts and crop-image inference (port 8000)

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Create an account and issue a bearer session |
| `POST` | `/auth/login` | No | Sign in and issue a bearer session |
| `GET` | `/auth/me` | Bearer token | Return the current account |
| `POST` | `/auth/logout` | Bearer token optional | Invalidate the supplied session |
| `POST` | `/predict` | No | Analyze an uploaded image (requires model weights and AI dependencies) |
| `GET` | `/health` | No | API and model readiness |

The app stores the access token in browser local storage. Account passwords are salted and hashed by the backend; the SQLite database is local to the installation unless `AUTH_DB_PATH` is configured elsewhere.

### Transportation (port 8000)

All transport endpoints require `Authorization: Bearer <access_token>`. Requests are scoped to the authenticated user.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/transport/requests` | List the signed-in user's requests, newest travel dates first |
| `POST` | `/transport/requests` | Submit a request with pickup, destination, date, work hours, passenger count and optional details |
| `DELETE` | `/transport/requests/{request_id}` | Cancel the user's pending request |

Example request body:

```json
{
  "pickup_location": "Village center, near the health clinic",
  "destination": "North cooperative field",
  "travel_date": "2026-12-02",
  "work_start": "08:00",
  "work_end": "16:30",
  "passengers": 4,
  "details": "Please call when the bus reaches the meeting point."
}
```

New requests have `status: "pending"`. This code records requests for cooperative follow-up; it does not include dispatcher assignment, vehicle availability, route optimization, notifications, or a booking-confirmation workflow.

### Virtual sensor and calendar (port 8001)

The virtual sensor contract, reading provenance, configuration bounds and calendar endpoints are documented in [`soil_sensor/README.md`](soil_sensor/README.md). Generated readings are marked `simulated`; user-entered readings are marked `manual`. Calendar sensor-run events are plans until an actual reading is generated and saved. Soil recommendations are threshold-based.

## Data and persistence

- Backend account/session/transport data is stored in the SQLite file at `AUTH_DB_PATH` (default `model/shefarms.sqlite3`).
- Sensor readings and calendar events are stored in the simulator's SQLite database, configured with `SOIL_SENSOR_DB`.
- These database files contain runtime/user data and are intentionally excluded from version control.
- Keep backups of production databases. The included local SQLite design is intended for development and small demonstrations; production deployments should use managed persistence and backups.
- Model datasets, training runs, Python environments and caches are local artifacts and should not be committed.

## Troubleshooting

### `ERR_CONNECTION_REFUSED` or browser cannot reach an API

Check that the relevant backend terminal is still running and that the expected port is listening. Open the health URLs above. Check that `.env.local` points to the same host and port, and restart Vite after changing it.

### Login or transport page reports a backend error

Start the port-8000 service from the `model` directory using its virtual environment. Register an account before signing in. Transport endpoints require a valid logged-in session; pending requests are visible to the account that created them.

### Soil Analysis or Calendar cannot connect

Start `soil_sensor/start-soil-simulator.ps1`, check port 8001 `/health`, and verify `VITE_SOIL_SENSOR_API_URL`. Review simulator CORS origins if the frontend uses a non-default host or port.

### Crop analysis says model weights were not found

Place a compatible trained checkpoint at `model/best.pt`, or set `MODEL_PATH`. Restart the API after adding or changing the checkpoint. Install the optional AI requirements in the same Python environment used to run the backend. Without a checkpoint, authentication, transport and other API routes remain available.

### Dependency installation fails

Confirm internet access and use a supported Python version. ML dependencies such as PyTorch can be platform- and Python-version-specific; install the optional AI requirements separately from the small API runtime if needed.

## Development

Frontend scripts:

```powershell
npm run dev      # Vite development server
npm run build    # Production bundle in dist/
npm run preview  # Serve the production bundle locally
npm run lint     # ESLint
```

The React app and FastAPI services are separate processes. Configure their base URLs through the environment variables above rather than hard-coding deployment URLs into components.

## Security notes

- Never commit `.env` files, API keys, passwords, session tokens, local databases, or private user data.
- Use HTTPS, a production-grade session/cookie policy, a managed database, backups, rate limiting and explicit production CORS origins before public deployment.
- Local defaults bind APIs to loopback. Do not expose the development servers directly to the public internet.
- Do not treat a transport request as a confirmed ride until the cooperative adds and operates a confirmation/dispatch process.
