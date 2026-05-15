@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."
set "ENV_FILE=%ROOT_DIR%\gateway\.env"
set "DOCKER_CONTAINER=mySql"
set "USE_DOCKER=0"
set "SQL_FILE="

:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="--docker" (
    set "USE_DOCKER=1"
    shift
    goto :parse_args
)
set "SQL_FILE=%~1"
shift
goto :parse_args
:args_done

if not exist "%ENV_FILE%" (
    echo Erreur: %ENV_FILE% introuvable. Copiez gateway\.env.example vers gateway\.env et configurez-le.
    pause
    exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%a in ("%ENV_FILE%") do (
    if "%%a"=="DB_HOST"     set "DB_HOST=%%b"
    if "%%a"=="DB_PORT"     set "DB_PORT=%%b"
    if "%%a"=="DB_USER"     set "DB_USER=%%b"
    if "%%a"=="DB_PASSWORD" set "DB_PASSWORD=%%b"
    if "%%a"=="DB_NAME"     set "DB_NAME=%%b"
)

if not defined DB_HOST set "DB_HOST=localhost"
if not defined DB_PORT set "DB_PORT=3306"

if not defined DB_USER (
    echo Erreur: DB_USER doit etre defini dans gateway\.env
    pause
    exit /b 1
)
if not defined DB_NAME (
    echo Erreur: DB_NAME doit etre defini dans gateway\.env
    pause
    exit /b 1
)

set "PASS_ARG="
if defined DB_PASSWORD set "PASS_ARG=-p%DB_PASSWORD%"

if "%SQL_FILE%"=="" goto :mode_reset

REM ==================== MODE 1: Restauration depuis un fichier SQL ====================
:mode_restore
if not exist "%SQL_FILE%" (
    echo Erreur: Fichier '%SQL_FILE%' introuvable.
    pause
    exit /b 1
)

echo.
echo ATTENTION: Cela va ecraser toutes les donnees actuelles de '%DB_NAME%'.
set /p CONFIRM=Confirmer la restauration depuis '%SQL_FILE%' ? (oui/non):
if /i not "%CONFIRM%"=="oui" (
    echo Restauration annulee.
    pause
    exit /b 0
)

echo Restauration en cours...

if "%USE_DOCKER%"=="1" (
    powershell -NoProfile -Command "Get-Content '%SQL_FILE%' | Where-Object { $_ -notmatch 'GTID_PURGED' } | & docker exec -i %DOCKER_CONTAINER% mysql -u %DB_USER% %PASS_ARG% %DB_NAME%"
) else (
    powershell -NoProfile -Command "Get-Content '%SQL_FILE%' | Where-Object { $_ -notmatch 'GTID_PURGED' } | & mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PASS_ARG% %DB_NAME%"
)

if %errorlevel% neq 0 (
    echo Erreur lors de la restauration.
    pause
    exit /b 1
)

echo Restauration terminee avec succes !
pause
exit /b 0

REM ==================== MODE 2: Reinitialisation complete ====================
:mode_reset
echo.
echo Usage: restore.bat [--docker] [fichier_backup.sql]
echo.
echo Aucun fichier SQL fourni - mode reinitialisation complete.
echo La base '%DB_NAME%' sera supprimee et recreee avec migrations et seeders.
echo.
echo ATTENTION: Toutes les donnees actuelles seront PERDUES.
set /p CONFIRM=Confirmer la reinitialisation complete ? (oui/non):
if /i not "%CONFIRM%"=="oui" (
    echo Reinitialisation annulee.
    pause
    exit /b 0
)

echo.
echo Suppression et recreation de la base '%DB_NAME%'...

if "%USE_DOCKER%"=="1" (
    docker exec %DOCKER_CONTAINER% mysql -u %DB_USER% %PASS_ARG% -e "DROP DATABASE IF EXISTS %DB_NAME%; CREATE DATABASE %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
) else (
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PASS_ARG% -e "DROP DATABASE IF EXISTS %DB_NAME%; CREATE DATABASE %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
)

if %errorlevel% neq 0 (
    echo Erreur lors de la recreation de la base.
    pause
    exit /b 1
)

echo.
echo Execution des migrations...

echo Gateway...
cd /d "%ROOT_DIR%\gateway"
call npx sequelize-cli db:migrate
if %errorlevel% neq 0 ( echo Erreur migration Gateway. & pause & exit /b 1 )
cd /d "%ROOT_DIR%"

echo Back-office Service...
cd /d "%ROOT_DIR%\micro-services\back-office-service"
call npx sequelize-cli db:migrate
if %errorlevel% neq 0 ( echo Erreur migration Back-office Service. & pause & exit /b 1 )
cd /d "%ROOT_DIR%"

echo Product Service...
cd /d "%ROOT_DIR%\micro-services\product-service"
call npx sequelize-cli db:migrate
if %errorlevel% neq 0 ( echo Erreur migration Product Service. & pause & exit /b 1 )
cd /d "%ROOT_DIR%"

echo Front-office Service...
cd /d "%ROOT_DIR%\micro-services\front-office-service"
call npx sequelize-cli db:migrate
if %errorlevel% neq 0 ( echo Erreur migration Front-office Service. & pause & exit /b 1 )
cd /d "%ROOT_DIR%"

echo Payments Service...
cd /d "%ROOT_DIR%\micro-services\payments-service"
call npx sequelize-cli db:migrate
if %errorlevel% neq 0 ( echo Erreur migration Payments Service. & pause & exit /b 1 )
cd /d "%ROOT_DIR%"

echo.
echo Execution des seeders...

echo Product Service...
cd /d "%ROOT_DIR%\micro-services\product-service"
call npx sequelize-cli db:seed:all --seeders-path seeders --models-path src/models --config config/config.js
if %errorlevel% neq 0 ( echo Erreur seeding Product Service. & pause & exit /b 1 )
cd /d "%ROOT_DIR%"

echo Front-office Service...
cd /d "%ROOT_DIR%\micro-services\front-office-service"
call npx sequelize-cli db:seed:undo --seed 001-seed-checkout.js --seeders-path seeders --models-path src/models --config config/config.js
if %errorlevel% neq 0 ( echo Warning: seed:undo ignore - peut etre absent, non bloquant )
call npx sequelize-cli db:seed:all --seeders-path seeders --models-path src/models --config config/config.js
if %errorlevel% neq 0 ( echo Erreur seeding Front-office Service. & pause & exit /b 1 )
cd /d "%ROOT_DIR%"

echo.
echo Reinitialisation complete terminee avec succes !
pause
