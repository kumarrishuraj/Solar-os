Write-Host "========================================================" -ForegroundColor Green
Write-Host "Starting SolarOS Platform (FastAPI Backend + Next.js Frontend)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

$Root = $PSScriptRoot

# Start Backend in dedicated terminal window
Write-Host "1. Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root/backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# Start Frontend in dedicated terminal window
Write-Host "2. Starting Next.js Frontend on http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root/frontend'; npm run dev"

Write-Host "`nBoth services are now running in their own windows:" -ForegroundColor Green
Write-Host "  - Frontend Web App:     http://localhost:3000" -ForegroundColor Yellow
Write-Host "  - Backend REST API:     http://localhost:8000" -ForegroundColor Yellow
Write-Host "  - Interactive Swagger:  http://localhost:8000/docs" -ForegroundColor Yellow
