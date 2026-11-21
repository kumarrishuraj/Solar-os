# SolarOS - Unified Runner Script
# Starts both the FastAPI Backend and Next.js Frontend

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting SolarOS Platform Services (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start FastAPI Backend in background job / window
Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$BackendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" -PassThru

# 2. Start Next.js Frontend
Write-Host "[2/2] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
Set-Location "$ScriptDir\frontend"
.\node_modules\.bin\next dev -p 3000
