#!/bin/bash
echo "================================================"
echo "  SACL Quality Management System - Deploy"
echo "================================================"

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed on this server."
    echo "Please install Docker and Docker Compose first."
    exit 1
fi

echo "Pulling latest images from Docker Hub..."
sudo docker-compose pull

echo "Starting application containers..."
sudo docker-compose up -d

echo ""
echo "================================================"
echo "  Deployment Complete!"
echo "  Your application is now running."
echo "  Frontend should be accessible on port 80."
echo "  Check logs using: sudo docker-compose logs -f"
echo "================================================"
