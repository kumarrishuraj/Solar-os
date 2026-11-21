@echo off
echo ========================================================
echo Starting SolarOS Platform (FastAPI Backend + Next.js Frontend)
echo ========================================================

echo 1. Starting FastAPI Backend on http://localhost:8000 ...
start "SolarOS Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo 2. Starting Next.js Frontend on http://localhost:3000 ...
start "SolarOS Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Both services are running in their respective windows!
echo.
echo - Frontend Web Application: http://localhost:3000
echo - Backend REST API:         http://localhost:8000
echo - Interactive Swagger Docs: http://localhost:8000/docs
echo ========================================================
pause
