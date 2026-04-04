@echo off
setlocal

set ROOT=%~dp0

echo Démarrage de tous les services...
echo.

start "gateway"          cmd /k "cd /d %ROOT%gateway && npm run dev"
start "back-office"      cmd /k "cd /d %ROOT%micro-services\back-office-service && npm run dev"
start "front-office"     cmd /k "cd /d %ROOT%micro-services\front-office-service && npm run dev"
start "product-service"  cmd /k "cd /d %ROOT%micro-services\product-service && npm run dev"
start "frontend"         cmd /k "cd /d %ROOT%frontend && npm run dev"

echo Tous les services sont en cours de démarrage dans des fenêtres séparées.
echo Fermez chaque fenêtre pour arrêter le service correspondant.
