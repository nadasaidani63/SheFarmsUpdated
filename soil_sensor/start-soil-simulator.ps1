$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (-not (Test-Path ".venv")) {
    py -3 -m venv .venv
}
& ".\.venv\Scripts\Activate.ps1"
python -m pip install --upgrade pip
pip install -r requirements.txt
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}
Write-Host "Starting SheFarms Virtual Soil Sensor API on http://127.0.0.1:8001"
uvicorn soil_simulator.main:app --host 127.0.0.1 --port 8001 --reload
