# CasaOS Deployment Helper Script (Windows PowerShell)

Write-Host "=== CasaOS Deployment Helper for OwnProject ===" -ForegroundColor Green
Write-Host ""

# Variables (Edit these for your CasaOS setup)
$CASAOS_IP = "192.168.1.100"    # Change to your CasaOS IP
$CASAOS_USER = "casaos"         # Change to your CasaOS username  
$PROJECT_DIR = "/opt/ownproject"

Write-Host "This script will help you deploy OwnProject to CasaOS" -ForegroundColor Yellow
Write-Host "Make sure you have edited the variables at the top of this script!" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Have you updated CASAOS_IP and CASAOS_USER in this script? (y/n)"
if ($response -notmatch "^[Yy]$") {
    Write-Host "Please edit this script with your CasaOS details first!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Creating project directory on CasaOS..." -ForegroundColor Cyan
ssh "$CASAOS_USER@$CASAOS_IP" "mkdir -p $PROJECT_DIR"

Write-Host "Step 2: Copying files to CasaOS..." -ForegroundColor Cyan
scp -r backend/ "$CASAOS_USER@$CASAOS_IP`:$PROJECT_DIR/"
scp docker-compose.casaos.yml "$CASAOS_USER@$CASAOS_IP`:$PROJECT_DIR/docker-compose.yml"
scp .env.casaos "$CASAOS_USER@$CASAOS_IP`:$PROJECT_DIR/.env"

Write-Host "Step 3: Setting up environment file..." -ForegroundColor Cyan
ssh "$CASAOS_USER@$CASAOS_IP" "cd $PROJECT_DIR && cp .env.casaos .env"

Write-Host "Step 4: Building and starting Docker containers..." -ForegroundColor Cyan
ssh "$CASAOS_USER@$CASAOS_IP" "cd $PROJECT_DIR && docker-compose up -d --build"

Write-Host "Step 5: Waiting for containers to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

Write-Host "Step 6: Running database migrations..." -ForegroundColor Cyan
ssh "$CASAOS_USER@$CASAOS_IP" "cd $PROJECT_DIR && docker exec ownproject-backend python migrate_profile_fields.py"
ssh "$CASAOS_USER@$CASAOS_IP" "cd $PROJECT_DIR && docker exec ownproject-backend python migrate_theme_system.py"

Write-Host "Step 7: Checking container status..." -ForegroundColor Cyan
ssh "$CASAOS_USER@$CASAOS_IP" "cd $PROJECT_DIR && docker-compose ps"

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Your backend should be available at: http://$CASAOS_IP`:8000" -ForegroundColor Yellow
Write-Host "Health check: http://$CASAOS_IP`:8000/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "Don't forget to update your frontend .env.production file with:" -ForegroundColor Magenta
Write-Host "VITE_API_BASE_URL=http://$CASAOS_IP`:8000/api" -ForegroundColor White
Write-Host ""
Write-Host "Then redeploy your frontend with:" -ForegroundColor Magenta
Write-Host "cd frontend; npm run build; firebase deploy --only hosting" -ForegroundColor White

# Optional: Open browser to check deployment
$openBrowser = Read-Host "Would you like to open the health check URL in your browser? (y/n)"
if ($openBrowser -match "^[Yy]$") {
    Start-Process "http://$CASAOS_IP`:8000/health"
}