# Docker Setup Guide

This guide explains how to run the application using Docker containers.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- Git

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd OwnProject
cp .env.example .env
```

### 2. Development Mode (with hot reload)

```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up --build

# Access the application
Frontend: http://localhost:5173
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs
Database: localhost:5432
```

### 3. Production Mode

```bash
# Update .env.prod with your production secrets first!
docker-compose --env-file .env.prod up --build -d

# Access the application
Frontend: http://localhost:3000
Backend API: http://localhost:8000
```

## Architecture

### Services

- **frontend**: React app with Vite (dev) or Nginx (prod)
- **backend**: FastAPI application with Python 3.11
- **db**: PostgreSQL 15 database with persistent volume

### Ports

- Frontend: 3000 (prod), 5173 (dev)
- Backend: 8000
- Database: 5432

### Volumes

- `postgres_data`: Database persistence
- `backend_data`: Backend app data
- Source code mounted for development hot reload

## Environment Configuration

### Files

- `.env.example`: Template with defaults
- `.env.dev`: Development settings
- `.env.prod`: Production settings (update secrets!)
- `.env`: Local override (gitignored)

### Key Variables

```bash
# Database
POSTGRES_DB=myapp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password

# Backend
SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://user:pass@db:5432/dbname
ALLOWED_ORIGINS=http://localhost:3000

# Security
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Development Workflow

### Hot Reload Development

```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend-dev
```

### Database Management

```bash
# Access database
docker-compose exec db psql -U postgres -d myapp_dev

# Run migrations
docker-compose exec backend python -m alembic upgrade head

# Create migration
docker-compose exec backend python -m alembic revision --autogenerate -m "description"
```

### Individual Services

```bash
# Build specific service
docker-compose build backend

# Restart service
docker-compose restart backend

# View service logs
docker-compose logs -f backend

# Execute commands in container
docker-compose exec backend bash
docker-compose exec frontend-dev sh
```

## Production Deployment

### 1. Update Environment

```bash
# Copy and edit production environment
cp .env.prod .env
# Edit .env with your production values
```

### 2. Security Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Update `POSTGRES_PASSWORD` with strong password
- [ ] Set `ALLOWED_ORIGINS` to your domain(s)
- [ ] Update database credentials
- [ ] Review nginx security headers

### 3. Deploy

```bash
# Build and start in production mode
docker-compose --env-file .env up --build -d

# Check status
docker-compose ps
docker-compose logs
```

### 4. Backup & Maintenance

```bash
# Backup database
docker-compose exec db pg_dump -U postgres myapp > backup.sql

# Update containers
docker-compose pull
docker-compose up -d

# Clean up
docker system prune
```

## Troubleshooting

### Common Issues

**Port conflicts**:

```bash
# Check what's using ports
netstat -tulpn | grep :8000
# Stop conflicting services
```

**Database connection issues**:

```bash
# Check database health
docker-compose exec db pg_isready -U postgres
# Reset database
docker-compose down -v
docker-compose up -d
```

**Build failures**:

```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose build --no-cache
```

**Permission issues (Linux)**:

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Logs & Debugging

```bash
# View all logs
docker-compose logs

# Follow specific service
docker-compose logs -f backend

# Debug container
docker-compose exec backend bash
docker-compose exec frontend-dev sh

# Check health status
docker-compose ps
```

## Development Tips

1. **Fast rebuilds**: Only rebuild when dependencies change
2. **Volume mounts**: Source code changes reflect immediately
3. **Database resets**: Use `docker-compose down -v` to reset data
4. **Multiple environments**: Use different compose files
5. **Resource usage**: Monitor with `docker stats`

## File Structure

```
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Development orchestration
├── .env.example               # Environment template
├── .env.dev                   # Development variables
├── .env.prod                  # Production variables
├── .dockerignore              # Root docker ignore
├── backend/
│   ├── Dockerfile            # Backend container
│   └── .dockerignore         # Backend specific ignores
└── frontend/
    ├── Dockerfile            # Production frontend
    ├── Dockerfile.dev        # Development frontend
    ├── nginx.conf           # Nginx configuration
    └── .dockerignore        # Frontend specific ignores
```
