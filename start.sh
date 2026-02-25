#!/bin/bash
echo "============================================"
echo "  Visio3D - Starting Backend + Frontend"
echo "============================================"

# Backend
echo ""
echo "[1/2] Starting Backend (FastAPI)..."
cd backend
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

sleep 2

# Frontend
echo ""
echo "[2/2] Starting Frontend (Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo " Backend:  http://localhost:8000"
echo " Frontend: http://localhost:5173"
echo " API Docs: http://localhost:8000/docs"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT
wait
