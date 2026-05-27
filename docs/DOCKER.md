# EnvPro Docker Setup Guide

## Overview

EnvPro is containerized with Docker for seamless deployment and development. The stack includes:

- **Frontend**: React + Vite application served by Nginx (port 8080)
- **Backend**: Spring Boot 3.2.5 with Java 25 LTS (port 8888)
- **Database**: PostgreSQL 16 Alpine (port 5432)

## Architecture

```
┌─────────────────────────────────────────────┐
│         Client Browser                       │
│         http://localhost:8080                │
└────────────────┬────────────────────────────┘
                 │
        ┌────────▼────────┐
        │   Nginx (Web)   │
        │   Port 80       │
        ├─────────────────┤
        │ • Frontend SPA  │
        │ • API Proxy     │
        │ • WebSocket     │
        └────────┬────────┘
                 │ (http://backend:8888)
        ┌────────▼──────────────┐
        │  Spring Boot Backend   │
        │  Java 25 LTS           │
        │  Port 8888             │
        ├───────────────────────┤
        │ • REST API            │
        │ • WebSockets          │
        │ • Business Logic      │
        └────────┬──────────────┘
                 │ (jdbc:postgresql://postgres:5432)
        ┌────────▼──────────────┐
        │  PostgreSQL 16        │
        │  Port 5432            │
        ├───────────────────────┤
        │ • EnvPro Database     │
        │ • Flyway Migrations   │
        └───────────────────────┘
```

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- 4GB+ free disk space
- 2GB+ available RAM
- Internet connection (for image pulls)

## Quick Start

### 1. Configure Environment

```bash
# Windows
docker.cmd env

# Linux/Mac
./docker.sh env
```

This creates a `.env` file with default settings. Edit it to customize:

```env
DB_PASSWORD=envpro_secure_password
SPRING_PROFILE_ACTIVE=production
JAVA_OPTS=-Xmx512m -Xms256m
```

### 2. Build Images

```bash
# Windows
docker.cmd build

# Linux/Mac
./docker.sh build
```

This builds:
- Backend image using Maven + Java 25
- Frontend image using Node.js 20 + npm

### 3. Start the Stack

```bash
# Windows
docker.cmd up

# Linux/Mac
./docker.sh up
```

Services will be available at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8888
- **Database**: localhost:5432

### 4. Verify Health

```bash
# Windows
docker.cmd health

# Linux/Mac
./docker.sh health
```

## Command Reference

### Using Management Scripts

#### Windows
```bash
docker.cmd build              # Build all images
docker.cmd up                 # Start stack
docker.cmd down               # Stop stack
docker.cmd restart            # Restart services
docker.cmd logs [service]     # View logs
docker.cmd ps                 # Show containers
docker.cmd health             # Check health
docker.cmd clean              # Remove containers & volumes
docker.cmd rebuild            # Clean rebuild
docker.cmd env                # Initialize .env
```

#### Linux/Mac
```bash
./docker.sh build             # Build all images
./docker.sh up                # Start stack
./docker.sh down              # Stop stack
./docker.sh restart           # Restart services
./docker.sh logs [service]    # View logs
./docker.sh ps                # Show containers
./docker.sh health            # Check health
./docker.sh clean             # Remove containers & volumes
./docker.sh rebuild           # Clean rebuild
./docker.sh env               # Initialize .env
```

### Using Docker Compose Directly

```bash
# Build images
docker-compose build

# Start services (daemon)
docker-compose up -d

# Start services (foreground - see logs)
docker-compose up

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f postgres

# Check status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

## Accessing Services

### Frontend
- **URL**: http://localhost:8080
- **Browser**: Open in web browser
- **Served by**: Nginx container (port 80)

### Backend API
- **URL**: http://localhost:8888
- **Health check**: http://localhost:8888/actuator/health
- **Swagger UI** (if configured): http://localhost:8888/swagger-ui.html

### Database
- **Host**: localhost:5432
- **Username**: envpro_user
- **Database**: envpro_db
- **Tool**: Use DBeaver, pgAdmin, or psql

```bash
# Connect via psql (if installed)
psql -h localhost -U envpro_user -d envpro_db
```

## File Structure

```
EnvPro/
├── Dockerfile              # Frontend image definition
├── Dockerfile.backend      # Backend image definition
├── docker-compose.yaml     # Multi-container orchestration
├── .dockerignore           # Files to exclude from Docker context
├── docker.sh               # Linux/Mac management script
├── docker.cmd              # Windows management script
├── .env.example            # Environment template
├── nginx.conf              # Nginx proxy configuration
├── server/
│   └── pom.xml             # Backend Maven config (Java 25)
├── src/                    # Frontend React source
└── docs/
    └── DOCKER.md           # This file
```

## Common Workflows

### Development Workflow

1. **Make code changes** (frontend/backend)
2. **Rebuild specific service**:
   ```bash
   docker-compose build backend
   docker-compose restart backend
   ```
3. **View logs to verify**:
   ```bash
   docker-compose logs -f backend
   ```

### Database Operations

**View PostgreSQL logs**:
```bash
docker-compose logs postgres
```

**Access PostgreSQL CLI**:
```bash
docker-compose exec postgres psql -U envpro_user -d envpro_db
```

**Reset database** (remove volume):
```bash
docker-compose down -v
docker-compose up -d
```

### Debugging

**View all logs**:
```bash
docker-compose logs -f
```

**View specific service logs**:
```bash
docker-compose logs -f backend
docker-compose logs -f web
docker-compose logs -f postgres
```

**Shell into container**:
```bash
docker-compose exec backend /bin/sh
docker-compose exec web /bin/sh
docker-compose exec postgres /bin/bash
```

**Check resource usage**:
```bash
docker stats
```

## Performance Tuning

### Adjust Java Heap Size
Edit `.env`:
```env
JAVA_OPTS=-Xmx1024m -Xms512m
```

Rebuild and restart:
```bash
docker-compose build backend
docker-compose up -d
```

### Database Optimization
Edit `docker-compose.yaml` PostgreSQL service environment:
```yaml
environment:
  POSTGRES_INITDB_ARGS: -c max_connections=100 -c shared_buffers=256MB
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### API not responding
```bash
# Check backend health
docker-compose logs backend

# Verify database connection
docker-compose logs postgres

# Restart backend
docker-compose restart backend
```

### Database connection errors
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Out of disk space
```bash
# Clean up unused images and volumes
docker system prune -a

# Remove only dangling images
docker image prune -a
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Customize `.env` with production passwords
- [ ] Update database credentials
- [ ] Configure `JAVA_OPTS` for production load
- [ ] Review `nginx.conf` security headers
- [ ] Set proper resource limits in `docker-compose.yaml`
- [ ] Enable log rotation
- [ ] Set up monitoring/alerting

### Example Production Configuration

`.env`:
```env
DB_PASSWORD=<use strong password>
SPRING_PROFILE_ACTIVE=production
JAVA_OPTS=-Xmx2048m -Xms1024m -XX:+UseG1GC
```

`docker-compose.yaml` (add deploy section):
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Java 25 LTS in Docker

- **Base Image**: `eclipse-temurin:25-jre-alpine` (Backend runtime)
- **Build Image**: `maven:3.9.11-eclipse-temurin-25-alpine` (Backend build)
- **Spring Boot Version**: 3.2.5 (fully compatible with Java 25)

The Dockerfile.backend uses a two-stage build for optimized image size:
1. **Build stage**: Compiles Spring Boot application with Maven
2. **Runtime stage**: Minimal JRE-only image for production

## Security

### Network Isolation
- Services communicate via internal Docker network `envpro-network`
- Only frontend (port 80) and database port (5432) exposed to host
- Backend port (8888) only accessible through Nginx proxy

### Environment Variables
- Database password from `.env` (git-ignored)
- Sensitive data not hardcoded in Dockerfile
- Use `--build-arg` for build secrets if needed

### Security Headers
Nginx configures:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer-when-downgrade`

## Health Checks

All services include health checks:

**Frontend**: HTTP GET on port 80  
**Backend**: HTTP GET on `/actuator/health` on port 8888  
**Database**: `pg_isready` command

View health status:
```bash
docker-compose ps
```

Status indicators:
- `healthy` - Service is running normally
- `unhealthy` - Service detected as failing
- `starting` - Service is initializing

## Logs

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service
```bash
docker-compose logs -f backend    # View backend logs
docker-compose logs -f web        # View frontend logs
docker-compose logs -f postgres   # View database logs
```

### View Last N Lines
```bash
docker-compose logs --tail=50 backend
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Java 25 Release Notes](https://www.oracle.com/java/technologies/javase/25-release-notes.html)

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review this guide's Troubleshooting section
3. Check GitHub Issues: https://github.com/bhoomiijain/EnvPro/issues
