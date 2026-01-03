# Start Task Management Server
Write-Host "Starting Task Management System Server..." -ForegroundColor Green
Write-Host "Server will be available at http://localhost:3000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

node server.js

