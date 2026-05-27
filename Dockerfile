# syntax=docker/dockerfile:1

# Stage 1: Build frontend with Node.js
FROM node:20-alpine AS frontend-build
WORKDIR /build

# Copy frontend dependencies and configuration
COPY package.json package-lock.json ./
COPY index.html vite.config.js ./
COPY src ./src

# Install dependencies and build
RUN npm ci --no-audit --no-fund && npm run build

# Stage 2: Production nginx server
FROM nginx:1.27-alpine

LABEL maintainer="EnvPro Team"
LABEL description="EnvPro - Environment Management Dashboard Frontend"

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from build stage
COPY --from=frontend-build /build/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Expose web port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
