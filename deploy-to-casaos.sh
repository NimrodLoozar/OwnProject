#!/bin/bash
# CasaOS Deployment Helper Script

echo "=== CasaOS Deployment Helper for OwnProject ==="
echo

# Variables (Edit these for your CasaOS setup)
CASAOS_IP="192.168.1.100"  # Change to your CasaOS IP
CASAOS_USER="casaos"       # Change to your CasaOS username
PROJECT_DIR="/opt/ownproject"

echo "This script will help you deploy OwnProject to CasaOS"
echo "Make sure you have edited the variables at the top of this script!"
echo

read -p "Have you updated CASAOS_IP and CASAOS_USER in this script? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please edit this script with your CasaOS details first!"
    exit 1
fi

echo "Step 1: Creating project directory on CasaOS..."
ssh $CASAOS_USER@$CASAOS_IP "mkdir -p $PROJECT_DIR"

echo "Step 2: Copying files to CasaOS..."
scp -r backend/ $CASAOS_USER@$CASAOS_IP:$PROJECT_DIR/
scp docker-compose.casaos.yml $CASAOS_USER@$CASAOS_IP:$PROJECT_DIR/docker-compose.yml
scp .env.casaos $CASAOS_USER@$CASAOS_IP:$PROJECT_DIR/.env
scp migrate_*.py $CASAOS_USER@$CASAOS_IP:$PROJECT_DIR/

echo "Step 3: Setting up Docker containers..."
ssh $CASAOS_USER@$CASAOS_IP "cd $PROJECT_DIR && docker-compose up -d --build"

echo "Step 4: Waiting for containers to start..."
sleep 30

echo "Step 5: Running database migrations..."
ssh $CASAOS_USER@$CASAOS_IP "cd $PROJECT_DIR && docker exec -it ownproject-backend python migrate_profile_fields.py"
ssh $CASAOS_USER@$CASAOS_IP "cd $PROJECT_DIR && docker exec -it ownproject-backend python migrate_theme_system.py"

echo "Step 6: Checking container status..."
ssh $CASAOS_USER@$CASAOS_IP "cd $PROJECT_DIR && docker-compose ps"

echo
echo "=== Deployment Complete! ==="
echo "Your backend should be available at: http://$CASAOS_IP:8000"
echo "Health check: http://$CASAOS_IP:8000/health"
echo
echo "Don't forget to update your frontend .env.production file with:"
echo "VITE_API_BASE_URL=http://$CASAOS_IP:8000/api"
echo
echo "Then redeploy your frontend with:"
echo "cd frontend && npm run build && firebase deploy --only hosting"