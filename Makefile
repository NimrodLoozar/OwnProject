# Docker management commands

# Default target
.DEFAULT_GOAL := help

# Development
.PHONY: dev
dev: ## Start development environment with hot reload
	docker-compose -f docker-compose.dev.yml up --build

.PHONY: dev-d
dev-d: ## Start development environment in background
	docker-compose -f docker-compose.dev.yml up --build -d

.PHONY: dev-logs
dev-logs: ## Follow development logs
	docker-compose -f docker-compose.dev.yml logs -f

# Production
.PHONY: prod
prod: ## Start production environment
	docker-compose --env-file .env.prod up --build -d

.PHONY: prod-logs
prod-logs: ## Follow production logs
	docker-compose logs -f

# Database
.PHONY: db-migrate
db-migrate: ## Run database migrations
	docker-compose exec backend python -m alembic upgrade head

.PHONY: db-shell
db-shell: ## Access database shell
	docker-compose exec db psql -U postgres -d myapp_dev

# Cleanup
.PHONY: down
down: ## Stop all services
	docker-compose down

.PHONY: clean
clean: ## Stop services and remove volumes
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v

.PHONY: rebuild
rebuild: ## Rebuild all containers
	docker-compose build --no-cache

# Logs
.PHONY: logs
logs: ## Show all logs
	docker-compose logs

.PHONY: logs-backend
logs-backend: ## Follow backend logs
	docker-compose logs -f backend

.PHONY: logs-frontend
logs-frontend: ## Follow frontend logs
	docker-compose logs -f frontend

# Health
.PHONY: ps
ps: ## Show running containers
	docker-compose ps

.PHONY: stats
stats: ## Show container resource usage
	docker stats

# Help
.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
