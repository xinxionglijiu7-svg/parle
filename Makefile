# Parle! - Development Commands
# ================================

# --- Development ---
.PHONY: dev install lint

## Start development server
dev:
	npm run dev

## Install dependencies (auto-runs prisma generate)
install:
	npm install

## Run linter
lint:
	npm run lint

# --- Database ---
.PHONY: db-generate db-push db-studio

## Generate Prisma client
db-generate:
	npx prisma generate

## Push schema to MongoDB Atlas
db-push:
	npx prisma db push

## Open Prisma Studio (DB viewer)
db-studio:
	npx prisma studio

# --- Build & Deploy ---
.PHONY: build deploy

## Production build (prisma generate + next build)
build:
	npm run build

## Deploy to Vercel (requires vercel CLI login)
deploy:
	npx vercel --prod

# --- Setup ---
.PHONY: setup env-check

## First-time setup: install deps + generate prisma + push schema
setup: install db-push
	@echo "Setup complete. Run 'make dev' to start."

## Verify required environment variables are set
env-check:
	@echo "Checking environment variables..."
	@test -n "$$DATABASE_URL" || (echo "ERROR: DATABASE_URL not set" && exit 1)
	@test -n "$$ANTHROPIC_API_KEY" || (echo "ERROR: ANTHROPIC_API_KEY not set" && exit 1)
	@test -n "$$GOOGLE_CLOUD_TTS_API_KEY" || (echo "ERROR: GOOGLE_CLOUD_TTS_API_KEY not set" && exit 1)
	@test -n "$$JWT_SECRET" || (echo "ERROR: JWT_SECRET not set" && exit 1)
	@echo "All required environment variables are set."

# --- Utilities ---
.PHONY: clean jwt-secret

## Clean build artifacts
clean:
	rm -rf .next node_modules/.cache

## Generate a new JWT secret
jwt-secret:
	@openssl rand -base64 32

# --- Help ---
.PHONY: help
help:
	@echo "Available commands:"
	@echo ""
	@echo "  Development:"
	@echo "    make dev          Start development server"
	@echo "    make install      Install dependencies"
	@echo "    make lint         Run linter"
	@echo ""
	@echo "  Database:"
	@echo "    make db-generate  Generate Prisma client"
	@echo "    make db-push      Push schema to MongoDB"
	@echo "    make db-studio    Open Prisma Studio"
	@echo ""
	@echo "  Build & Deploy:"
	@echo "    make build        Production build"
	@echo "    make deploy       Deploy to Vercel"
	@echo ""
	@echo "  Setup:"
	@echo "    make setup        First-time project setup"
	@echo "    make env-check    Verify environment variables"
	@echo ""
	@echo "  Utilities:"
	@echo "    make clean        Clean build artifacts"
	@echo "    make jwt-secret   Generate a new JWT secret"
