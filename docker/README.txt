ReWear Docker Configuration
===========================

This folder contains all Docker-related files for the ReWear application.

Files:
------
- Dockerfile.backend   : Backend (Node.js) container configuration
- Dockerfile.frontend  : Frontend (Nginx) container configuration  
- docker-compose.yml   : Multi-container orchestration

Usage:
------
From the project root directory:

1. Start application:
   docker compose -f docker/docker-compose.yml up -d --build
   docker compose -f docker/docker-compose.yml --env-file .env up -d --build

2. Stop application:
   docker compose -f docker/docker-compose.yml down

3. View logs:
   docker compose -f docker/docker-compose.yml logs -f

4. Check status:
   docker compose -f docker/docker-compose.yml ps

Ports:
------
- Frontend: http://localhost:3000
- Backend:  http://localhost:5000

Requirements:
-------------
- Docker Desktop installed
- .env file in project root with required variables
