#!/bin/bash

# ReWear Deployment Script for Azure VM
# This script automates the deployment process

set -e

echo "🚀 ReWear Deployment Script"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file from .env.production template"
    exit 1
fi

# Get VM IP
VM_IP=$(curl -s ifconfig.me)
echo -e "${GREEN}📍 VM IP Address: $VM_IP${NC}"
echo ""

# Ask for confirmation
read -p "Do you want to update frontend API URLs to use this IP? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🔄 Updating API URLs in frontend files...${NC}"
    
    # Backup original files
    mkdir -p backups
    cp -r docs backups/docs_$(date +%Y%m%d_%H%M%S)
    
    # Update API URLs
    find docs -name "*.js" -o -name "*.html" | while read file; do
        sed -i "s|http://localhost:5000|http://$VM_IP:5000|g" "$file"
        sed -i "s|https://rewear-ycn9.onrender.com|http://$VM_IP:5000|g" "$file"
    done
    
    echo -e "${GREEN}✅ API URLs updated${NC}"
fi

echo ""
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker compose -f docker/docker-compose.yml build

echo ""
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose -f docker/docker-compose.yml up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

echo ""
echo -e "${YELLOW}🔍 Checking service status...${NC}"
docker compose -f docker/docker-compose.yml ps

echo ""
echo -e "${YELLOW}📊 Testing backend API...${NC}"
if curl -s http://localhost:5000/api/products > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
fi

echo ""
echo -e "${YELLOW}📊 Testing frontend...${NC}"
if curl -s http://localhost/ > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Access your application:"
echo -e "  Frontend: ${GREEN}http://$VM_IP${NC}"
echo -e "  Backend:  ${GREEN}http://$VM_IP:5000/api${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:     docker compose -f docker/docker-compose.yml logs -f"
echo "  Stop services: docker compose -f docker/docker-compose.yml down"
echo "  Restart:       docker compose -f docker/docker-compose.yml restart"
echo ""
