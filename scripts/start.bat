@echo off
setlocal

set ROOT=%~dp0
set MODE=%1
if "%MODE%"=="" set MODE=dev

if not "%MODE%"=="dev" if not "%MODE%"=="prod" (
  echo Usage: start.bat [dev^|prod]
  echo   dev  -- frontend started with npm run dev ^(default^)
  echo   prod -- frontend built then served with vite preview --host
  exit /b 1
)

echo Démarrage de tous les services en mode '%MODE%'...
echo.

start "gateway"          cmd /k "cd /d %ROOT%gateway && npm run dev"
start "back-office"      cmd /k "cd /d %ROOT%micro-services\back-office-service && npm run dev"
start "front-office"     cmd /k "cd /d %ROOT%micro-services\front-office-service && npm run dev"
start "product-service"  cmd /k "cd /d %ROOT%micro-services\product-service && npm run dev"
start "payments-service" cmd /k "cd /d %ROOT%micro-services\payments-service && npm run dev"

if "%MODE%"=="dev" (
  start "frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"
) else (
  start "frontend" cmd /k "cd /d %ROOT%frontend && npm run build && npx vite preview --host"
)

echo Tous les services sont en cours de démarrage dans des fenêtres séparées.
echo Fermez chaque fenêtre pour arrêter le service correspondant.
