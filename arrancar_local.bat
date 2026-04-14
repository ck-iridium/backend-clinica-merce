@echo off
echo Iniciando Clinica Merce...

:: Abre una terminal para el Backend
start "Backend FastApi" cmd /k "cd backend && venv\Scripts\activate && python -m uvicorn app.main:app --reload"

:: Abre una terminal para el Frontend
start "Frontend NextJS" cmd /k "cd frontend && npm run dev"

echo Servidores en marcha.