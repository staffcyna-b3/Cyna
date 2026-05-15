@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."

echo Démarrage de l'installation complète...

REM ==================== INSTALLATION DES DÉPENDANCES ====================
echo Installation des dépendances...

echo → Frontend...
cd /d "%ROOT_DIR%\frontend"
call npm install

echo → Gateway...
cd /d "%ROOT_DIR%\gateway"
call npm install

echo → Back-office Service...
cd /d "%ROOT_DIR%\micro-services\back-office-service"
call npm install

echo → Front-office Service...
cd /d "%ROOT_DIR%\micro-services\front-office-service"
call npm install

echo → Product Service...
cd /d "%ROOT_DIR%\micro-services\product-service"
call npm install

echo → Payments Service...
cd /d "%ROOT_DIR%\micro-services\payments-service"
call npm install

REM ==================== MIGRATIONS ====================
echo Exécution des migrations...

echo → Gateway migrations...
cd /d "%ROOT_DIR%\gateway"
call npx sequelize-cli db:migrate

echo → Back-office Service migrations...
cd /d "%ROOT_DIR%\micro-services\back-office-service"
call npx sequelize-cli db:migrate

echo → Product Service migrations...
cd /d "%ROOT_DIR%\micro-services\product-service"
call npx sequelize-cli db:migrate

echo → Front-office Service migrations...
cd /d "%ROOT_DIR%\micro-services\front-office-service"
call npx sequelize-cli db:migrate

echo → Payments Service migrations...
cd /d "%ROOT_DIR%\micro-services\payments-service"
call npx sequelize-cli db:migrate

REM ==================== SEEDERS ====================
echo Exécution des seeders...

echo → Product Service seeders...
cd /d "%ROOT_DIR%\micro-services\product-service"
call npx sequelize-cli db:seed:all --seeders-path seeders --models-path src/models --config config/config.js

echo Installation complète terminée !
pause
