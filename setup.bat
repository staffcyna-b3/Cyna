@echo off
setlocal enabledelayedexpansion

echo Démarrage de l'installation complète...

REM ==================== INSTALLATION DES DÉPENDANCES ====================
echo Installation des dépendances...


echo → Frontend...
cd frontend
call npm install
cd ..


echo → Gateway...
cd gateway
call npm install
cd ..

echo → Back-office Service...
cd micro-services\back-office-service
call npm install
cd ..\..

echo → Front-office Service...
cd micro-services\front-office-service
call npm install
cd ..\..

echo → Product Service...
cd micro-services\product-service
call npm install
cd ..\..

echo → Payments Service...
cd micro-services\payments-service
call npm install
cd ..\..

REM ==================== MIGRATIONS ====================
echo Exécution des migrations...

echo → Gateway migrations...
cd gateway
call npx sequelize-cli db:migrate
cd ..

echo → Product Service migrations...
cd micro-services\product-service
call npx sequelize-cli db:migrate
cd ..\..

echo → Front-office Service migrations...
cd micro-services\front-office-service
call npx sequelize-cli db:migrate
cd ..\..

echo → Payments Service migrations...
cd micro-services\payments-service
call npx sequelize-cli db:migrate
cd ..\..

REM ==================== SEEDERS ====================
echo Exécution des seeders...

echo → Product Service seeders...
cd micro-services\product-service
call npx sequelize-cli db:seed:all --seeders-path seeders --models-path src/models --config config/config.js
cd ..\..

echo Installation complète terminée !
pause
