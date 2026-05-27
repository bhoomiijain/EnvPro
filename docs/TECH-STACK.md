# EnvPro — Technology Stack & DevOps Files

This document maps the **real** build and deployment tooling used in the repository (visible on GitHub under Actions and in the file tree).

## Stack overview

| Layer | Technology | Role |
|-------|------------|------|
| Frontend | React 18, Vite 5 | DevOps dashboard UI |
| Backend | Spring Boot 3.2, Java 21 | API scaffold, Flyway, JPA |
| Database | PostgreSQL 16 | Persistence (Docker Compose) |
| Build | Maven 3.9, npm | Monorepo build (`pom.xml` + `server/pom.xml`) |
| Containers | Docker, Docker Compose | Multi-service local/production-like stack |
| CI/CD | GitHub Actions | Automated build, test, Docker smoke tests, GHCR |

## Key files (checklist)

```
EnvPro/
├── pom.xml                          # Root Maven POM (frontend-maven-plugin → npm build)
├── server/pom.xml                   # Spring Boot Maven module
├── package.json                     # React / Vite dependencies
├── Dockerfile                       # Multi-stage: Node build → Nginx
├── Dockerfile.backend               # Multi-stage: Maven build → JRE 21
├── docker-compose.yaml              # postgres + backend + web
├── nginx.conf                       # SPA + API reverse proxy
├── .dockerignore
├── .env.example
├── .github/
│   ├── workflows/
│   │   ├── maven.yml                # mvn verify on push/PR
│   │   └── docker.yml               # docker compose build + smoke tests
│   └── dependabot.yml
└── server/src/main/resources/
    ├── application.yml
    └── db/migration/V1__envpro_schema.sql
```

## GitHub Actions

- **Maven Build** — Installs Java 21 & Node 20, runs `mvn verify`, uploads `dist/` and `envpro-server.jar`.
- **Docker Build** — Builds Compose stack, curls frontend (`:8081`) and backend health (`:8888/actuator/health`), pushes `ghcr.io/<owner>/envpro-web` on `main`.

Badge URLs in `README.md` point to these workflows.

## Local commands

```bash
# UI only
npm install && npm run dev

# Full Maven build (matches CI)
mvn verify

# Full Docker stack
docker compose up --build
```
