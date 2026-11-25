$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$LocalPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
$BackendPython = Join-Path $PSScriptRoot "..\model\.venv\Scripts\python.exe"

# Prefer the simulator environment, then reuse the SheFarms backend environment
# if it already has FastAPI installed. This avoids a second download/install on
# machines where the main backend dependencies are already available.
if (Test-Path $LocalPython) {
    $PythonExe = (Resolve-Path $LocalPython).Path
} elseif (Test-Path $BackendPython) {
    $PythonExe = (Resolve-Path $BackendPython).Path
} else {
    $PyLauncher = Get-Command py -ErrorAction SilentlyContinue
    if (-not $PyLauncher) {
        throw "Python was not found. Install Python 3.10+ or create model\.venv first."
    }
    $LocalVenv = Join-Path $PSScriptRoot ".venv"
    & py -3 -m venv $LocalVenv
    if ($LASTEXITCODE -ne 0) { throw "Could not create soil_sensor\.venv." }
    $PythonExe = (Resolve-Path $LocalPython).Path
}

& $PythonExe -c "import fastapi, uvicorn, pydantic"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing virtual soil sensor dependencies..."
    & $PythonExe -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw "Simulator dependency installation failed. Check the Python/pip output above." }
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

Write-Host "Starting SheFarms Virtual Soil Sensor API on http://127.0.0.1:8001"
Write-Host "Health check: http://127.0.0.1:8001/health"
Write-Host "Keep this PowerShell window open while using Soil Analysis or Calendar."
& $PythonExe -m uvicorn soil_simulator.main:app --host 127.0.0.1 --port 8001 --reload
if ($LASTEXITCODE -ne 0) { throw "The simulator stopped with an error. Check whether port 8001 is already in use." }
