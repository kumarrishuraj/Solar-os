@echo off
title SolarOS Runner
echo ==========================================================
echo   Starting SolarOS Platform Services (Backend + Frontend)
echo ==========================================================

set SCRIPT_DIR=%~dp0

:: Start Backend
start "SolarOS Backend (FastAPI)" powershell -NoExit -Command "cd '%SCRIPT_DIR%backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Start Frontend
cd /d "%SCRIPT_DIR%frontend"
echo Starting Frontend on http://localhost:3000...
.\node_modules\.bin\next dev -p 3000
