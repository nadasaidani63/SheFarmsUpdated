# SheFarms Virtual Soil Sensor (standalone service)

This is a **software simulator**, not a connection to physical probes or hardware.
Every automatically generated reading is stored with `source: "simulated"`.
Values entered by a person are stored with `source: "manual"`.

## Run on Windows

Open PowerShell in this folder:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\start-soil-simulator.ps1
```

API: `http://127.0.0.1:8001`  
Interactive API docs: `http://127.0.0.1:8001/docs`  
Health check: `http://127.0.0.1:8001/health`

The existing SheFarms Vite frontend can remain on port 5173 and its existing FastAPI backend can remain on port 8000. CORS defaults to the Vite development origins. Override via `.env` / environment variables.

## API contract

All JSON responses identify this as a virtual/simulated system.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Service health |
| GET | `/status` | Online state, running state, configured sensor, latest reading |
| GET | `/sensors` | List sensor configurations |
| PUT | `/sensors/config` | Create/update sensor, field, plot, interval and generation ranges |
| POST | `/simulation/start` | Start automatic generation |
| POST | `/simulation/stop` | Stop automatic generation |
| POST | `/readings/manual` | Save exact manually entered values |
| POST | `/readings/simulate` | Generate one simulated reading immediately |
| GET | `/readings?sensor_id=virtual-sensor-01&limit=100` | Recent readings, newest first |
| GET | `/readings?source=manual` | Filter manual readings |
| GET | `/readings?source=simulated` | Filter generated readings |

### Configure a sensor

`PUT /sensors/config`

```json
{
  "sensor_id": "virtual-sensor-01",
  "sensor_name": "North Plot Virtual Probe",
  "field_name": "North Field",
  "plot_name": "Plot A",
  "interval_seconds": 30,
  "ranges": {
    "ph": {"minimum": 5.8, "maximum": 7.2},
    "moisture": {"minimum": 30, "maximum": 60},
    "temperature": {"minimum": 18, "maximum": 31},
    "nitrogen": {"minimum": 25, "maximum": 90},
    "phosphorus": {"minimum": 12, "maximum": 55},
    "potassium": {"minimum": 90, "maximum": 210},
    "organic_matter": {"minimum": 1.5, "maximum": 5.5}
  }
}
```

Ranges are checked against safe domain bounds. Generated values use a bounded random walk: the first value starts near the center of its configured range, and later readings change gradually while staying inside that range. Automatic generation is only active after explicitly calling `/simulation/start`.

### Start and stop automatic mode

`POST /simulation/start`

```json
{"interval_seconds": 30}
```

`POST /simulation/stop` requires no body. The simulator starts in manual/stopped mode by default.

### Save a manual reading

`POST /readings/manual`

```json
{
  "sensor_id": "virtual-sensor-01",
  "ph": 6.4,
  "moisture": 42,
  "temperature": 24.5,
  "nitrogen": 55,
  "phosphorus": 28,
  "potassium": 145,
  "organic_matter": 3.2
}
```

The server validates each field and returns HTTP 422 for out-of-range input, or HTTP 404 for an unknown sensor.

### Reading response

A stored reading contains `timestamp`, `sensor_id`, `field_name`, `plot_name`, all seven measurements and `source` (`simulated` or `manual`). Data persists in SQLite at `SOIL_SENSOR_DB` (default `./data/soil_sensor.sqlite3`).

## SheFarms integration

The SheFarms Soil Analysis page uses `VITE_SOIL_SENSOR_API_URL=/soil-api` in development. Vite proxies these same-origin browser requests to this API on port 8001. For a separately hosted frontend, set the variable to the deployed API URL and configure CORS accordingly. The page loads stored readings into the metrics, history chart, and threshold-based recommendations. Sensor controls support configuration, one-off simulated readings, manual demonstration readings, and starting or stopping automatic mode. The dashboard explicitly labels this as a virtual simulator, not physical hardware or machine-learning analysis.

The Calendar page stores tasks and activities through `/calendar/events` and can schedule virtual sensor runs. A planned run is not a measurement; it is shown as completed only after the simulator generates and saves its reading. Scheduled runs execute only while this API process is running. Failed runs are visible and can be retried.


## Calendar API (persistent)

Calendar records are stored separately from sensor readings in the same SQLite database. A planned sensor run is a calendar event, **not** a soil measurement. A reading is only linked to the event after the simulator successfully creates and persists it.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/calendar/events?start=...&end=...` | List events in a date range |
| POST | `/calendar/events` | Create a task, activity or scheduled sensor run |
| GET | `/calendar/events/{id}` | Read one event |
| PUT | `/calendar/events/{id}` | Edit an event |
| DELETE | `/calendar/events/{id}` | Delete an event |
| POST | `/calendar/events/{id}/retry` | Retry a failed sensor run |

Example task/activity:

```json
{
  "title": "Inspect north plot",
  "description": "Check irrigation and soil condition",
  "event_type": "activity",
  "start_at": "2026-11-26T09:00:00+01:00",
  "end_at": "2026-11-26T09:30:00+01:00",
  "location": "North Field / Plot A",
  "status": "planned"
}
```

Example scheduled virtual reading:

```json
{
  "title": "Virtual soil reading — Plot A",
  "description": "Scheduled simulated sensor run",
  "event_type": "sensor_run",
  "start_at": "2026-11-26T10:00:00+01:00",
  "location": "North Field / Plot A",
  "status": "planned",
  "sensor_id": "virtual-sensor-01",
  "field_name": "North Field",
  "plot_name": "Plot A"
}
```

When due, the service runs the virtual sensor and persists a reading with `source: "simulated"`. The calendar event then becomes `completed` and contains `reading_id`. If the service is offline when the scheduled time passes, the event is retained and marked `failed` on the next startup with an explanatory error. Use the retry endpoint after the service is online. Tasks and activities remain unchanged by simulator execution.

### What happens when the app is closed?

Calendar events are stored in SQLite, so closing the browser or React app does not delete them. Scheduled sensor runs execute only while the **simulator API process is running**; the scheduler is hosted by that process. If the API is stopped or the computer is off at the due time, that run cannot happen then. On the next API startup it is marked failed (not completed) and can be retried from the UI/API. For reliable background execution, keep the simulator process running (or configure Windows Task Scheduler to start it at login).


## Configuration details

The service loads `.env` from the simulator project root (the directory containing `requirements.txt`), independent of the current PowerShell working directory. A relative `SOIL_SENSOR_DB` path is resolved against that same project root; an absolute path is used as supplied. The default CORS allowlist includes both `http://localhost:5173` and `http://127.0.0.1:5173`. Set `SOIL_SENSOR_CORS_ORIGINS` to a comma-separated allowlist to override it.

The frontend can define `VITE_SOIL_SENSOR_API_URL=/soil-api` in a Vite environment file for local development, or use the deployed API URL outside local development. Restart Vite after changing Vite environment variables. The current SheFarms repository has this integration in place.

### Run all local services (PowerShell)

Run these from the SheFarms project folder. Use three PowerShell terminals and keep each server window open.

Terminal 1 — simulator (port 8001):

```powershell
cd .\soil_sensor
Set-ExecutionPolicy -Scope Process Bypass
.\start-soil-simulator.ps1
```

Terminal 2 — existing SheFarms backend (port 8000; run from the original repo):

```powershell
.\start-backend.bat
```

Terminal 3 — Vite frontend (port 5173; run from the original repo):

```powershell
npm install
npm run dev -- --host 127.0.0.1
```

Verify simulator connectivity at `http://127.0.0.1:8001/health` and its API docs at `http://127.0.0.1:8001/docs`. Verify CORS by opening the frontend from either localhost origin.
