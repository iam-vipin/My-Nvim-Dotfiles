.PHONY: build start stop logs restart clean

# Load .env file
include .env
export

# Define services
SERVICES := fastapi vectordb-feeder

# Default to local environment if not specified
# Set environment based on DEBUG value
ENV := $(if $(filter 9,$(DEBUG)),local,$(if $(filter 1,$(DEBUG)),preview,local))
COMPOSE_FILE := docker-compose-$(ENV).yml

# Generic commands that can take a service name as argument
build-%:
	docker compose -f $(COMPOSE_FILE) up -d --build $*

start-%:
	docker compose -f $(COMPOSE_FILE) up -d $*

stop-%:
	docker compose -f $(COMPOSE_FILE) stop $*

logs-%:
	docker compose -f $(COMPOSE_FILE) logs -f $*

# Generic commands for all services
build:
	docker compose -f $(COMPOSE_FILE) up -d --build

start:
	docker compose -f $(COMPOSE_FILE) up -d

stop:
	docker compose down

logs:
	docker compose -f $(COMPOSE_FILE) logs -f

restart:
	docker compose down && docker compose -f $(COMPOSE_FILE) up -d

clean:
	docker compose down -v