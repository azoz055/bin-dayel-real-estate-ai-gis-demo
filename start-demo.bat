@echo off
cd /d %~dp0
echo Starting Bin Dayel Real Estate AI GIS Demo...
echo.
echo First time only: if dependencies are missing, run: npm install
echo.
npm run preview
pause
