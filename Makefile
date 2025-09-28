.PHONY: all build up down backend frontend db-clean

all: build up

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

backend:
	docker-compose up -d backend

frontend:
	docker-compose up -d frontend

db-clean:
	docker-compose down -v
