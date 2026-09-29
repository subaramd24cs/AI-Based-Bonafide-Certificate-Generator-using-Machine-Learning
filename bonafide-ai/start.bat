@echo off
echo ==========================================
echo  Bonafide AI - Starting All Services
echo ==========================================
echo.

echo [1/3] Starting ML Service (port 5001)...
start "ML Service" cmd /k "cd /d "%~dp0ml" && python app.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend Server (port 5000)...
start "Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend (port 5173)...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==========================================
echo  All services starting!
echo  Frontend:  http://localhost:5173
echo  Backend:   http://localhost:5000
echo  ML Service: http://localhost:5001
echo ==========================================
echo.
pause
