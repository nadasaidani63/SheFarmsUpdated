@echo off
setlocal
cd /d "%~dp0model"

set "PYTHON=python"
if exist ".venv\Scripts\python.exe" set "PYTHON=.venv\Scripts\python.exe"

echo Installing the SheFarms API runtime...
"%PYTHON%" -m pip install -r requirements.txt
if errorlevel 1 (
  echo.
  echo Backend dependency installation failed. Check the Python and pip output above.
  pause
  exit /b 1
)

echo.
echo Starting SheFarms API at http://127.0.0.1:8000
echo Keep this window open while using the website.
"%PYTHON%" main.py
if errorlevel 1 pause
