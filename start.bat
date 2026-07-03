@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
set "NODE_OPTIONS=--use-system-ca"
cd /d "%~dp0"
echo Starting eSHTEMARANY dev server...
echo Open http://localhost:5173 in your browser
echo Do NOT open index.html directly - use the dev server URL above.
npm run dev
pause
