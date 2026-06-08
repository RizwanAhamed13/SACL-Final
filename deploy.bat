@echo off
echo ================================================
echo   SACL Quality Management System — Deploy
echo ================================================

:: Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Docker is not installed on this machine.
    echo  Please install Docker Desktop from https://www.docker.com
    echo  Then run this script again.
    echo.
    pause
    exit /b 1
)

:: Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Docker is installed but not running.
    echo  Please open Docker Desktop and wait for it to start,
    echo  then run this script again.
    echo.
    pause
    exit /b 1
)

echo  Docker is ready.
echo.

:: Create .env file with all credentials
(
echo SPRING_PROFILES_ACTIVE=prod
echo DB_HOST=192.168.7.75
echo DB_PORT=1433
echo DB_NAME=SakthiWeb
echo DB_USERNAME=SakthiWeb
echo DB_PASSWORD=SakthiWeb@2)2%%
echo DB_ENCRYPT=false
echo DB_TRUST_CERT=false
echo JWT_SECRET=sacl-quality-jwt-secret-must-be-64chars-minimum-change-this-now!!
echo CORS_ORIGINS=http://192.168.7.75:9201
) > .env

echo [1/3] Credentials file created.

:: Pull latest images from Docker Hub
echo [2/3] Downloading images from Docker Hub...
docker compose pull

:: Start containers
echo [3/3] Starting application...
docker compose up -d

echo.
echo ================================================
echo   Done! Open browser and go to:
echo   http://192.168.7.75:9201
echo.
echo   Login: EMP043 / Rizwan@25012007
echo ================================================
pause
