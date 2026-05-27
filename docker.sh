#!/bin/bash
# EnvPro Docker Build & Run Script
# This script helps build and run the EnvPro application stack with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Main script
print_header "EnvPro Docker Management"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install Docker Compose first."
fi

print_success "Docker and docker-compose are installed"

# Parse command argument
COMMAND=${1:-help}

case $COMMAND in
    build)
        print_header "Building Docker images"
        docker-compose build
        print_success "Docker images built successfully"
        ;;
    up)
        print_header "Starting EnvPro stack"
        docker-compose up -d
        print_success "EnvPro stack started"
        echo ""
        echo "Services:"
        echo "  Frontend:  http://localhost:8080"
        echo "  Backend:   http://localhost:8888"
        echo "  Database:  localhost:5432"
        echo ""
        print_warning "Initial database setup may take a moment. Check logs with: docker-compose logs postgres"
        ;;
    down)
        print_header "Stopping EnvPro stack"
        docker-compose down
        print_success "EnvPro stack stopped"
        ;;
    restart)
        print_header "Restarting EnvPro stack"
        docker-compose restart
        print_success "EnvPro stack restarted"
        ;;
    logs)
        print_header "Streaming logs"
        SERVICE=${2:-""}
        if [ -z "$SERVICE" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$SERVICE"
        fi
        ;;
    ps)
        print_header "Container status"
        docker-compose ps
        ;;
    clean)
        print_header "Cleaning up Docker resources"
        read -p "This will remove containers and volumes. Continue? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            print_success "Cleanup completed"
        fi
        ;;
    rebuild)
        print_header "Rebuilding Docker images (fresh build)"
        docker-compose down -v
        docker-compose build --no-cache
        docker-compose up -d
        print_success "EnvPro stack rebuilt and restarted"
        ;;
    health)
        print_header "Health check"
        echo "Checking PostgreSQL..."
        if docker-compose exec -T postgres pg_isready -U envpro_user &> /dev/null; then
            print_success "PostgreSQL is healthy"
        else
            print_error "PostgreSQL is not responding"
        fi
        
        echo "Checking Backend API..."
        if curl -s http://localhost:8888/actuator/health > /dev/null; then
            print_success "Backend API is healthy"
        else
            print_warning "Backend API is not responding (may still be starting)"
        fi
        
        echo "Checking Frontend..."
        if curl -s http://localhost:8080 > /dev/null; then
            print_success "Frontend is healthy"
        else
            print_warning "Frontend is not responding (may still be starting)"
        fi
        ;;
    env)
        print_header "Setting up environment variables"
        if [ ! -f .env ]; then
            cp .env.example .env
            print_success ".env file created from .env.example"
            print_warning "Please customize .env with your database password and other settings"
        else
            print_warning ".env file already exists"
        fi
        ;;
    push)
        print_header "Building and Pushing to Docker Hub"
        DOCKER_USERNAME=${2:-bhoomiijain}
        PUSH_VERSION=${3:-latest}
        print_info "Using Docker Hub username: $DOCKER_USERNAME"
        print_info "Using version tag: $PUSH_VERSION"
        ./build-push.sh "$DOCKER_USERNAME" "$PUSH_VERSION"
        ;;
    help|--help|-h)
        print_header "Usage"
        echo "  ./docker.sh [COMMAND] [OPTIONS]"
        echo ""
        echo "Commands:"
        echo "  build         - Build Docker images"
        echo "  up            - Start the application stack"
        echo "  down          - Stop the application stack"
        echo "  restart       - Restart all services"
        echo "  logs [SERVICE]- View logs (optionally filter by service: web, backend, postgres)"
        echo "  ps            - Show container status"
        echo "  clean         - Remove containers and volumes"
        echo "  rebuild       - Clean rebuild and restart everything"
        echo "  health        - Check health status of all services"
        echo "  env           - Initialize .env file"
        echo "  push [USER] [VERSION] - Build and push to Docker Hub"
        echo "  help          - Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./docker.sh build          # Build images"
        echo "  ./docker.sh up             # Start stack"
        echo "  ./docker.sh logs backend   # View backend logs"
        echo "  ./docker.sh health         # Check service health"
        echo "  ./docker.sh push bhoomiijain v1.0.0  # Push to Docker Hub"
        ;;
    *)
        print_error "Unknown command: $COMMAND\nRun './docker.sh help' for usage information"
        ;;
esac
