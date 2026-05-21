# EnvPro Docker Quick Start

## One-Command Setup

```bash
# Windows (PowerShell)
cd C:\Users\Dell\OneDrive\Desktop\EnvPro
.\docker.cmd env    # Setup environment
.\docker.cmd build  # Build images
.\docker.cmd up     # Start stack

# Linux/Mac
cd ~/Desktop/EnvPro
./docker.sh env     # Setup environment
./docker.sh build   # Build images
./docker.sh up      # Start stack
```

## What's Running

Once started, you'll have 3 services:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:8080 | React UI Dashboard |
| **Backend API** | http://localhost:8888 | Spring Boot REST API |
| **Database** | localhost:5432 | PostgreSQL Database |

## Initial Access

1. **Wait 10-15 seconds** for services to start
2. **Open browser**: http://localhost:8080
3. **Backend health check**: http://localhost:8888/actuator/health
4. **Database connection**:
   ```bash
   psql -h localhost -U envpro_user -d envpro_db
   ```
   Password: `envpro_secure_password` (from .env)

## Common Commands

```bash
# View logs
docker-compose logs -f              # All services
docker-compose logs -f backend      # Backend only
docker-compose logs -f postgres     # Database only

# Stop services
docker-compose down

# Restart after code changes
docker-compose restart backend

# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check status
docker-compose ps

# Health check all services
docker-compose logs postgres | grep "ready"
curl http://localhost:8888/actuator/health
curl http://localhost:8080
```

## Stack Architecture

```
Browser (http://localhost:8080)
    ↓
Nginx Container (frontend)
    ├→ Static React files
    └→ Proxy: /api/* → backend:8888
    └→ Proxy: /ws/* → backend:8888 (WebSocket)
    ↓
Spring Boot Container (backend) - Java 25 LTS
    ├→ Spring Boot 3.2.5
    ├→ REST API endpoints
    └→ WebSocket support
    ↓
PostgreSQL 16 Alpine (database)
    └→ JDBC connection pool
```

## Environment Configuration (.env)

```env
# Database
DB_PASSWORD=envpro_secure_password

# Java Runtime
JAVA_OPTS=-Xmx512m -Xms256m

# Spring Boot
SPRING_PROFILE_ACTIVE=production

# Project naming
COMPOSE_PROJECT_NAME=envpro
```

## Docker Images

**Frontend Image** (Dockerfile):
- Base: `node:20-alpine` (build) + `nginx:1.27-alpine` (runtime)
- Size: ~60MB
- Stages: 2 (build → production)

**Backend Image** (Dockerfile.backend):
- Build: `maven:3.9.11-eclipse-temurin-25-alpine`
- Runtime: `eclipse-temurin:25-jre-alpine`
- Size: ~200MB
- Java: 25.0.3 LTS
- Spring Boot: 3.2.5

**Database Image** (docker-compose):
- Image: `postgres:16-alpine`
- Size: ~50MB
- Volumes: postgres_data (persistent)

## Features

✅ **Multi-container orchestration** with Docker Compose  
✅ **Java 25 LTS** backend with Spring Boot 3.2.5  
✅ **PostgreSQL 16** with persistent volumes  
✅ **React + Vite** frontend with SPA routing  
✅ **Nginx proxy** with API/WebSocket support  
✅ **Health checks** on all services  
✅ **Environment variable** configuration  
✅ **Network isolation** (envpro-network bridge)  
✅ **Security headers** (XSS, clickjacking, MIME-type protection)  

## Troubleshooting

### Backend won't start
```bash
docker-compose logs backend
# Check for database connection errors
# Verify DB_PASSWORD in .env matches docker-compose.yaml
```

### Database connection fails
```bash
docker-compose exec postgres psql -U envpro_user -d envpro_db
# If fails, rebuild:
docker-compose down -v
docker-compose up -d
```

### Frontend showing "Cannot connect to API"
```bash
# Check Nginx proxy configuration
docker-compose logs web

# Verify backend is healthy
curl http://localhost:8888/actuator/health
```

### Out of disk space
```bash
docker system prune -a
docker volume prune
```

## Next Steps

1. ✅ **Docker build complete**
2. 📋 **Review docs/DOCKER.md** for full documentation
3. 🚀 **Start stack**: `docker.cmd up` (Windows) or `./docker.sh up` (Linux/Mac)
4. 📊 **Access frontend**: http://localhost:8080
5. 🔧 **Make code changes** and rebuild as needed
6. 📤 **Push changes** to GitHub

## Files Modified/Created

| File | Purpose |
|------|---------|
| `Dockerfile` | Frontend build & Nginx runtime |
| `Dockerfile.backend` | Backend build with Maven & Java 25 |
| `docker-compose.yaml` | Complete stack orchestration |
| `nginx.conf` | API proxy & WebSocket routing |
| `docker.sh` | Linux/Mac management script |
| `docker.cmd` | Windows management script |
| `.env.example` | Environment template |
| `docs/DOCKER.md` | Comprehensive guide |

All changes committed to: `appmod/java-upgrade-20260521180929`

## Support

- Full Docker guide: [docs/DOCKER.md](docs/DOCKER.md)
- GitHub: https://github.com/bhoomiijain/EnvPro
- Docker Docs: https://docs.docker.com/compose/
