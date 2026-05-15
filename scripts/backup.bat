@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."
set "ENV_FILE=%ROOT_DIR%\gateway\.env"
set "DOCKER_CONTAINER=mySql"
set "USE_DOCKER=0"

:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="--docker" set "USE_DOCKER=1"
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

if not exist "%ROOT_DIR%\backups" mkdir "%ROOT_DIR%\backups"

for /f "tokens=*" %%i in ('powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd_HHmmss'"') do set TIMESTAMP=%%i

set "BACKUP_FILE=%ROOT_DIR%\backups\backup_%DB_NAME%_%TIMESTAMP%.sql"

echo Sauvegarde de la base '%DB_NAME%' vers %BACKUP_FILE%...

if "%USE_DOCKER%"=="1" (
    docker exec %DOCKER_CONTAINER% mysqldump -u %DB_USER% %PASS_ARG% --single-transaction --routines --triggers --set-gtid-purged=OFF %DB_NAME% > "%BACKUP_FILE%"
) else (
    mysqldump -h %DB_HOST% -P %DB_PORT% -u %DB_USER% %PASS_ARG% --single-transaction --routines --triggers --set-gtid-purged=OFF %DB_NAME% > "%BACKUP_FILE%"
)

if %errorlevel% neq 0 (
    echo Erreur lors de la sauvegarde.
    if exist "%BACKUP_FILE%" del "%BACKUP_FILE%"
    pause
    exit /b 1
)

echo Backup cree: %BACKUP_FILE%
pause
