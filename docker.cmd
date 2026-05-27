@echo off
REM EnvPro Docker Build & Run Script (Windows)
REM This script helps build and run the EnvPro application stack with Docker

setlocal enabledelayedexpansion

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Error: docker-compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo Docker and docker-compose are installed.
echo.

REM Parse command argument
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=help

if "%COMMAND%"=="build" (
    echo === Building Docker images ===
    docker-compose build
    if errorlevel 0 echo Docker images built successfully.
    goto :eof
)

if "%COMMAND%"=="up" (
    echo === Starting EnvPro stack ===
    docker-compose up -d
    if errorlevel 0 (
        echo EnvPro stack started successfully.
        echo.
        echo Services:
        echo   Frontend:  http://localhost:8080
        echo   Backend:   http://localhost:8888
        echo   Database:  localhost:5432
        echo.
        echo Note: Initial database setup may take a moment.
    )
    goto :eof
)

if "%COMMAND%"=="down" (
    echo === Stopping EnvPro stack ===
    docker-compose down
    if errorlevel 0 echo EnvPro stack stopped.
    goto :eof
)

if "%COMMAND%"=="restart" (
    echo === Restarting EnvPro stack ===
    docker-compose restart
    if errorlevel 0 echo EnvPro stack restarted.
    goto :eof
)

if "%COMMAND%"=="logs" (
    set SERVICE=%2
    if "%SERVICE%"=="" (
        docker-compose logs -f
    ) else (
        docker-compose logs -f %SERVICE%
    )
    goto :eof
)

if "%COMMAND%"=="ps" (
    echo === Container status ===
    docker-compose ps
    goto :eof
)

if "%COMMAND%"=="clean" (
    echo === Cleaning up Docker resources ===
    set /p confirm=This will remove containers and volumes. Continue? (y/N):
    if /i "%confirm%"=="y" (
        docker-compose down -v
        echo Cleanup completed.
    )
    goto :eof
)

if "%COMMAND%"=="rebuild" (
    echo === Rebuilding Docker images (fresh build) ===
    docker-compose down -v
    docker-compose build --no-cache
    docker-compose up -d
    if errorlevel 0 echo EnvPro stack rebuilt and restarted.
    goto :eof
)

if "%COMMAND%"=="health" (
    echo === Health check ===
    echo.
    echo Checking services...
    echo.
    
    echo Checking Frontend...
    curl -s http://localhost:8080 >nul 2>&1
    if errorlevel 0 (
        echo [OK] Frontend is responding
    ) else (
        echo [WAIT] Frontend may still be starting
    )
    
    echo Checking Backend API...
    curl -s http://localhost:8888/actuator/health >nul 2>&1
    if errorlevel 0 (
        echo [OK] Backend API is healthy
    ) else (
        echo [WAIT] Backend API may still be starting
    )
    
    echo Checking PostgreSQL (via backend connection)...
    echo [INFO] Check docker-compose logs for PostgreSQL status
    goto :eof
)

if "%COMMAND%"=="env" (
    echo === Setting up environment variables ===
    if not exist .env (
        copy .env.example .env
        echo .env file created from .env.example
        echo Please customize .env with your database password and other settings
    ) else (
        echo .env file already exists
    )
    goto :eof
)

if "%COMMAND%"=="push" (
    echo === Building and Pushing to Docker Hub ===
    set USERNAME=%2
    if "!USERNAME!"=="" set USERNAME=bhoomiijain
    set VERSION=%3
    if "!VERSION!"=="" set VERSION=latest
    echo Using Docker Hub username: !USERNAME!
    echo Using version tag: !VERSION!
    call build-push.cmd !USERNAME! !VERSION!
    goto :eof
)

if "%COMMAND%"=="help" (
    echo === EnvPro Docker Management ===
    echo.
    echo Usage: docker.cmd [COMMAND]
    echo.
    echo Commands:
    echo   build       - Build Docker images
    echo   up          - Start the application stack
    echo   down        - Stop the application stack
    echo   restart     - Restart all services
    echo   logs [SVC]  - View logs (optionally filter by service: web, backend, postgres)
    echo   ps          - Show container status
    echo   clean       - Remove containers and volumes
    echo   rebuild     - Clean rebuild and restart everything
    echo   health      - Check health status of all services
    echo   env         - Initialize .env file
    echo   push        - Build and push images to Docker Hub
    echo   help        - Show this help message
    echo.
    echo Examples:
    echo   docker.cmd build        # Build images
    echo   docker.cmd up           # Start stack
    echo   docker.cmd logs backend # View backend logs
    echo   docker.cmd health       # Check service health
    echo   docker.cmd push         # Push to Docker Hub
    echo.
    goto :eof
)

echo Unknown command: %COMMAND%
echo Run 'docker.cmd help' for usage information
exit /b 1
