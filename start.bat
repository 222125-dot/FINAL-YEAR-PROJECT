@echo off
echo ============================================
echo   Visio3D - Starting Backend + Frontend
echo ============================================

echo.
echo [1/2] Starting Backend (FastAPI)...
start "Visio3D Backend" cmd /k "cd backend && venv\Scripts\activate && python main.py"

timeout /t 3 /nobreak >nul

echo.
echo [2/2] Starting Frontend (React + Vite)...
start "Visio3D Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo  API Docs: http://localhost:8000/docs
echo ============================================
echo.
pause
