#!/bin/bash

# ReWear Update Script
# Use this to update the application after code changes

set -e

echo "🔄 ReWear Update Script"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main

echo ""
echo -e "${YELLOW}🛑 Stopping services...${NC}"
docker compose -f docker/docker-compose.yml down

echo ""
echo -e "${YELLOW}🔨 Rebuilding images...${NC}"
docker compose -f docker/docker-compose.yml build --no-cache

echo ""
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose -f docker/docker-compose.yml up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

echo ""
echo -e "${YELLOW}🔍 Checking status...${NC}"
docker compose -f docker/docker-compose.yml ps

echo ""
echo -e "${GREEN}✅ Update complete!${NC}"
echo ""
echo "View logs: docker compose -f docker/docker-compose.yml logs -f"
echo ""
