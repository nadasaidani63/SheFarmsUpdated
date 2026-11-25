# SheFarms virtual soil sensor setup

The virtual sensor is a separate FastAPI service. It stores simulated and manual readings, calendar events, and scheduled sensor runs in SQLite. It does not connect to physical probes. Soil recommendations in the dashboard are threshold-based rules, not outputs from the crop-image model.

## One-time setup

Open PowerShell in the SheFarms project folder. Create the Vite environment file so both API URLs are explicit:

```powershell
Copy-Item .env.example .env.local
```

The local defaults are `VITE_API_URL=http://127.0.0.1:8000` for the existing SheFarms backend and `VITE_SOIL_SENSOR_API_URL=/soil-api` for the simulator. Vite proxies `/soil-api/*` to `http://127.0.0.1:8001/*` during development, avoiding browser CORS and localhost hostname differences. The simulator startup script creates `soil_sensor/.env` from `soil_sensor/.env.example` if it does not exist.

## Start the services

Use three PowerShell terminals. Keep all three open while using the app.

### Terminal 1 — virtual sensor and calendar API (port 8001)

```powershell
cd "C:\Users\MSI\Downloads\SheFarms-main\SheFarms-main\soil_sensor"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\start-soil-simulator.ps1
```

### Terminal 2 — SheFarms auth and crop-image API (port 8000)

```powershell
cd "C:\Users\MSI\Downloads\SheFarms-main\SheFarms-main"
.\start-backend.bat
```

### Terminal 3 — React/Vite app (port 5173)

```powershell
cd "C:\Users\MSI\Downloads\SheFarms-main\SheFarms-main"
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`, sign in, then navigate to Soil Analysis or Calendar.

## Verify and use

- Simulator health: `http://127.0.0.1:8001/health`
- Simulator API docs: `http://127.0.0.1:8001/docs`
- Existing SheFarms API health: `http://127.0.0.1:8000/health`
- Frontend: `http://127.0.0.1:5173`

In Soil Analysis, configure sensor name, field, plot, interval, and generated ranges. Generate a single simulated reading, start/stop automatic readings, or expand the manual entry section. The newest reading feeds the metric cards, chart, and threshold-based recommendations. Readings remain in the simulator's SQLite database after refresh.

In Calendar, create tasks or activities, or schedule a virtual soil reading. Scheduled runs execute while the simulator is running. When a scheduled run is missed while the service is down, it is marked failed when the service starts; use Retry after the service is online. A planned event is not shown as a measurement until the simulator has created the reading.

The simulator CORS allowlist defaults to `http://localhost:5173` and `http://127.0.0.1:5173`. Configure it in `soil_sensor/.env` with a comma-separated `SOIL_SENSOR_CORS_ORIGINS` value if another client needs direct browser access. Local Vite development uses its same-origin proxy. Restart Vite after changing `.env.local` and restart the simulator after changing `soil_sensor/.env`.
