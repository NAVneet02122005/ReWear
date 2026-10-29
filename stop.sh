#!/bin/bash

# ReWear Stop Script
# Gracefully stop all services

echo "🛑 Stopping ReWear services..."
docker compose -f docker/docker-compose.yml down

echo ""
echo "✅ All services stopped"
echo ""
echo "To start again: docker compose -f docker/docker-compose.yml up -d"
echo ""
