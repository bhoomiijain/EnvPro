# GitHub Actions — EnvPro

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [maven.yml](./maven.yml) | push, PR, manual | Maven `verify`: Vite frontend build + Spring Boot tests |
| [docker.yml](./docker.yml) | push, PR, manual | Docker Compose build, health smoke tests, GHCR publish on `main` |

These workflows demonstrate the project tech stack: **Maven**, **Docker**, and **GitHub Actions**.
