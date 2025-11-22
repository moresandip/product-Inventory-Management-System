@echo off
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F
start cmd /c "cd backend && npm start"
start cmd /c "cd frontend && npm start"
