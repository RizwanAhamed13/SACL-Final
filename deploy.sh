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

echo "Stopping existing containers..."
sudo docker-compose down

echo "Starting application containers..."
sudo docker-compose up -d

echo ""
echo "================================================"
echo "  Deployment Complete!"
echo "  Your application is now running."
echo "  Frontend should be accessible on port 80."
echo "  Check logs using: sudo docker-compose logs -f"
echo "================================================"

echo ""
echo "Waiting for backend services to initialize..."
sleep 10

echo ""
read -p "Do you want to watch the E2E tests run visually in the browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Starting Visual E2E Tests..."
    cd frontend
    npm install --legacy-peer-deps
    # Make sure we don't crash from missing playwright browsers on the server
    npx playwright install chromium
    ALLOW_PROD_E2E=1 BASE_URL=http://localhost npm run e2e:full-ui
    cd ..
fi
