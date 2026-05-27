# 🚀 EnvPro — Dynamic Environment Provisioning System

[![Maven Build](https://github.com/bhoomiijain/EnvPro/actions/workflows/maven.yml/badge.svg)](https://github.com/bhoomiijain/EnvPro/actions/workflows/maven.yml)
[![Docker Build](https://github.com/bhoomiijain/EnvPro/actions/workflows/docker.yml/badge.svg)](https://github.com/bhoomiijain/EnvPro/actions/workflows/docker.yml)

EnvPro is a modern DevOps orchestration platform that simulates dynamic ephemeral environment provisioning using CI/CD workflows, Docker containerization, and intelligent lifecycle management.

The project is designed to demonstrate real-world DevOps concepts such as isolated preview environments, automated deployment pipelines, rollback workflows, infrastructure monitoring, resource optimization, and environment cleanup automation.

Unlike traditional student deployment dashboards, EnvPro focuses on creating a cloud-native orchestration experience inspired by modern platforms such as Vercel, Railway, GitHub Actions, and Render.

---

# 🌟 Project Vision

Modern software teams frequently face challenges caused by shared development and testing environments. These include:

- Deployment conflicts
- Environment inconsistencies
- Resource wastage
- Delayed testing workflows
- Difficult rollback handling

EnvPro solves this problem by automatically provisioning isolated ephemeral environments for every code commit or deployment event.

Each environment is:
- dynamically created
- independently monitored
- automatically destroyed after expiration
- fully traceable through logs and deployment history

This simulates real-world DevOps preview deployment systems used in enterprise CI/CD infrastructures.

---

# ⚡ Core Features

## 🌐 Dynamic Environment Provisioning
- Create isolated preview environments per branch/commit
- Dynamic port allocation
- Environment lifecycle orchestration
- Parallel environment execution

---

## 🔄 CI/CD Pipeline Visualization

Visual pipeline stages:

```text
GitHub Push → Maven Build → Unit Tests → Docker Build → Deploy → Preview → Cleanup
```

Includes:
- animated pipeline execution
- stage status tracking
- duration metrics
- deployment analytics

---

## ⏳ Environment Lifecycle Automation

Supports complete lifecycle simulation:

```text
Building → Testing → Running → Failed → Destroyed
```

Features:
- TTL-based auto cleanup
- automatic destroy transitions
- cleanup scheduling
- lifecycle event tracking

---

## 📊 Real-Time Monitoring Dashboard

Tracks:
- active environments
- running containers
- deployment metrics
- commit activity
- resource utilization
- environment health

---

## 🧠 AI-Based Insights & Failure Detection

Intelligent insight engine providing:
- failure hints
- anomaly detection
- cleanup optimization suggestions
- deployment analytics
- resource spike alerts

---

## 📜 Live Logs & Monitoring

Interactive log monitoring system with:
- environment-specific logs
- CI/CD execution logs
- severity filtering
- auto-scroll live updates
- failure hint detection

---

## 🔁 Rollback Simulation

Supports:
- deployment revision tracking
- rollback history
- stable build restoration simulation
- deployment audit timeline

---

## 🌍 Infrastructure Visualization

Modern DevOps visualization components:
- pipeline execution flows
- environment orchestration dashboard
- deployment timelines
- lifecycle status indicators
- topology simulation

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React Icons
- Recharts

---

## DevOps & CI/CD
- GitHub Actions
- Docker
- Docker Compose
- Maven
- GitHub Workflows

---

## Backend (Planned Integration)
- Spring Boot
- PostgreSQL
- WebSocket-based real-time updates

---

## Design System
- Inter (Primary Font)
- JetBrains Mono (Logs/Terminal Font)
- Glassmorphism-inspired dark DevOps UI

---

# 🎨 UI/UX Highlights

EnvPro follows a modern cloud-native DevOps dashboard design inspired by enterprise orchestration platforms.

## UI Features
- Dark glassmorphism theme
- Animated deployment pipelines
- Live environment cards
- Infrastructure topology visualization
- Auto cleanup countdown rings
- Real-time logs terminal
- Deployment analytics dashboard
- AI insight cards
- Parallel environment visualization
- Interactive lifecycle indicators

## Color Palette
- Rich Dark Navy (`#0B1020`)
- Deep Slate (`#111827`)
- Electric Blue (`#3B82F6`)
- Cyan (`#06B6D4`)
- Emerald Green (`#10B981`)
- Amber (`#F59E0B`)
- Soft Red (`#EF4444`)

## Fonts
- Inter
- JetBrains Mono

## Icon Library
- Lucide React

---

# 📁 Important Project Files & Structure

## 🐳 Containerization

### `Dockerfile`
Defines the container image configuration for application deployment.

### `docker-compose.yaml`
Manages:
- multi-container orchestration
- application containers
- PostgreSQL services
- network configuration
- environment provisioning

---

## ⚙️ CI/CD Automation

### `.github/workflows/`
Contains GitHub Actions workflows for:
- build automation
- test execution
- Docker image creation
- deployment simulation
- cleanup workflows

---

## ☕ Maven Configuration

### `pom.xml`
Manages:
- dependencies
- build lifecycle
- plugins
- test execution
- artifact generation

---

## 🗄️ Database Design

### `docs/database-schema.sql`
Contains PostgreSQL schema for:
- users
- repositories
- commits
- pipelines
- builds
- environments
- deployments
- logs
- notifications
- resource monitoring

---

## 📊 Documentation & Architecture

### `docs/`
Includes:
- Mermaid architecture diagrams
- KPI queries
- infrastructure documentation
- workflow explanations
- deployment lifecycle visuals
- topology diagrams

---

## 🧠 State & Simulation Logic

### `src/context/EnvironmentContext.jsx`
Core state management layer handling:
- environment lifecycle simulation
- status transitions
- cleanup scheduling
- rollback orchestration
- real-time updates

---

## 📦 Mock Data Layer

### `src/data/mockData.js`
Contains:
- environment seed data
- deployment history
- logs simulation
- metrics simulation
- branch deployment states

---

## 🛠️ Utilities & Intelligence Layer

### `src/utils/envInsights.js`
Handles:
- failure hint generation
- resource analysis
- deployment insights
- cleanup recommendations
- anomaly detection

---

# 🧩 UI Modules

## Dashboard
Displays:
- active environments
- deployment analytics
- container metrics
- pipeline overview
- commit activity

---

## Environments
Features:
- environment cards
- live status indicators
- cleanup countdowns
- preview links
- resource metrics

---

## CI/CD Pipeline
Shows:
- stage progression
- build/test/deploy flow
- deployment duration
- AI insights
- execution history

---

## Logs & Monitor
Provides:
- live deployment logs
- environment logs
- warning/error filtering
- cleanup activity monitoring

---

## Architecture
Visual representation of:
- infrastructure orchestration
- container topology
- deployment flow
- service interaction

---

# 🗄️ Database Schema Overview

The project follows a DevOps-oriented database architecture.

## Core Tables

### users
Stores developer/admin details.

### repositories
Tracks connected GitHub repositories.

### commits
Stores commit history and metadata.

### pipelines
Tracks CI/CD pipeline executions.

### builds
Maintains Maven build records.

### environments
Core table storing ephemeral environment lifecycle data.

### deployments
Tracks deployment actions and rollback history.

### logs
Stores CI/CD and container logs.

### resource_usage
Tracks CPU, RAM, uptime, and monitoring metrics.

### notifications
Stores alerts and deployment notifications.

---

# 🌐 Infrastructure Workflow

```text
Developer Pushes Code
        ↓
GitHub Repository
        ↓
GitHub Actions Pipeline
        ↓
Maven Build & Tests
        ↓
Docker Image Creation
        ↓
Docker Compose Provisioning
        ↓
Ephemeral Environment Deployment
        ↓
Preview & Monitoring
        ↓
Auto Cleanup & Destruction
```

---

# 🚀 Run Instructions

## 📦 Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop
- Git

---

## 📥 Installation

```bash
npm install
```

---

## ▶️ Start Development Server

```bash
npm run dev
```

Default Vite URL:
```text
http://localhost:5173
```

If occupied, Vite automatically switches to:
```text
5174 / 5175 / ...
```

---

## 🏗️ Production Build (npm)

```bash
npm run build
npm run preview
```

---

## ☕ Full stack build (Maven + Node)

Builds the React dashboard and Spring Boot API, runs unit tests:

```bash
./mvnw verify
```

On Windows: `mvnw.cmd verify`

If `npm` fails with `EPERM` on `node_modules/.vite`, stop `npm run dev` first, then retry. Maven uses `npm install` (not `npm ci`) locally to avoid deleting locked Vite cache folders.

Artifacts: `dist/` (frontend), `server/target/envpro-server.jar` (API).

---

# 🐳 Docker Setup

## Build frontend image only

```bash
docker build -f Dockerfile -t envpro-web .
docker run --rm -p 8081:80 envpro-web
```

Open http://localhost:8081

---

## Run full stack (Docker Compose)

PostgreSQL + Spring Boot API + Nginx frontend:

```bash
docker compose up --build
```

| Service   | URL |
|-----------|-----|
| Web UI    | http://localhost:8081 |
| API       | http://localhost:8888 |
| API health| http://localhost:8888/actuator/health |
| Postgres  | localhost:5432 |

---

# 🔄 CI/CD on GitHub Actions

Workflows in `.github/workflows/`:

| Workflow | File | What it does |
|----------|------|----------------|
| **Maven Build** | `maven.yml` | `mvn verify` — npm build + Spring Boot compile & tests |
| **Docker Build** | `docker.yml` | `docker compose build`, smoke tests, GHCR push on `main` |

---

# 🔄 Planned Real DevOps Integrations

## Upcoming Backend Features
- REST API wired to the React dashboard
- PostgreSQL persistence (schema + Flyway ready)
- WebSocket real-time events
- Actual Docker provisioning
- GitHub webhook triggers
- Real deployment execution
- Container health monitoring

---

## Future Scalability Goals
- Kubernetes orchestration
- Prometheus/Grafana monitoring
- Redis event queue
- Multi-user authentication
- Cloud deployment support
- AI-driven failure prediction
- Infrastructure analytics engine

---

# ⚠️ Current Limitations

- Dashboard uses simulated environment lifecycle (UI demo layer)
- GitHub repository connection is mock data (not live GitHub OAuth)
- Ephemeral environments are not provisioned on a real cluster yet
- Backend API is scaffolded; primary UX runs in the browser today

---

# 🎯 Educational Objectives

This project demonstrates:
- DevOps lifecycle understanding
- CI/CD pipeline orchestration
- Docker-based environment isolation
- Infrastructure monitoring concepts
- Deployment lifecycle management
- Real-world preview deployment systems
- Modern DevOps dashboard design

---

# 🏆 Why EnvPro Is Different

EnvPro is not just a deployment dashboard.

It is designed as a:
✅ Dynamic environment orchestration platform  
✅ CI/CD visualization system  
✅ Infrastructure lifecycle simulator  
✅ DevOps operations dashboard  

The project emphasizes:
- automation
- scalability
- observability
- lifecycle management
- modern cloud-native DevOps workflows

---

# 💡 Unique Features That Make EnvPro Stand Out

- Dynamic ephemeral environment provisioning
- Parallel environment execution
- AI-powered deployment insights
- Auto cleanup lifecycle management
- Animated infrastructure topology
- Real-time deployment activity feeds
- Deployment rollback simulation
- Infrastructure analytics visualization
- Environment health monitoring
- Cloud-native DevOps UI experience

---

# 👨‍💻 Developed For

Academic DevOps learning, CI/CD workflow demonstration, infrastructure orchestration visualization, and cloud-native deployment lifecycle simulation.

---