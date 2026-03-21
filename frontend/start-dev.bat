@echo off
REM Start RuralDev Frontend Development Server
REM This script runs npm dev from the frontend directory

cd /d D:\Electrocoders\RuralDev\frontend
echo ===================================
echo RuralDev - Frontend Dev Server
echo ===================================
echo.
echo Starting Vite development server on http://localhost:5173
echo Backend API will proxy to http://localhost:5000
echo.
npm run dev

pause
