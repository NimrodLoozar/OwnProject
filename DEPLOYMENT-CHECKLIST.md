# CasaOS Deployment Pre-Flight Checklist

## Before Running the Deployment Script

### 1. CasaOS System Requirements

- [ ] CasaOS is installed and running
- [ ] **Portainer is installed** (from CasaOS App Store) ✨ **RECOMMENDED**
- [ ] SSH access is enabled on your CasaOS system (optional with Portainer)
- [ ] Docker and Docker Compose are available (bundled with Portainer)
- [ ] You have admin access to CasaOS and Portainer

### 2. Network Configuration

- [ ] Know your CasaOS IP address (check with `ip addr` on CasaOS)
- [ ] Port 8000 is available on your CasaOS system
- [ ] Port 5432 is available for PostgreSQL (internal to Docker)
- [ ] Firewall allows access to port 8000 if accessing externally

### 3. Security Preparation

- [ ] Generate strong passwords for database
- [ ] Create secure JWT secret key
- [ ] Edit `.env.casaos` file with your actual values:
  ```
  DB_PASSWORD=your_strong_database_password_here
  POSTGRES_PASSWORD=your_strong_database_password_here
  JWT_SECRET_KEY=your_super_secret_jwt_key_here
  ```

### 4. SSH Access Test

- [ ] Test SSH connection: `ssh your_username@your_casaos_ip`
- [ ] Ensure you can run Docker commands: `ssh your_username@your_casaos_ip "docker --version"`

### 5. Script Configuration

- [ ] Edit `deploy-to-casaos.ps1` (Windows) or `deploy-to-casaos.sh` (Linux/Mac)
- [ ] Update `CASAOS_IP` variable with your actual IP
- [ ] Update `CASAOS_USER` variable with your actual username
- [ ] Update `PROJECT_DIR` if you want a different location

### 6. File Preparation

- [ ] All backend files are present in the `backend/` directory
- [ ] `docker-compose.casaos.yml` exists in project root
- [ ] `.env.casaos` exists and is configured with real values
- [ ] Migration files are present in project root

## Quick Commands to Get Started

### Check your CasaOS IP (run on CasaOS):

```bash
ip addr show | grep inet
```

### Generate a strong JWT secret:

```bash
openssl rand -hex 32
```

### Generate a strong database password:

```bash
openssl rand -base64 32
```

### Test SSH connection:

```powershell
ssh your_username@your_casaos_ip "echo 'Connection successful'"
```

## Deployment Steps

### 🐳 **RECOMMENDED: Using Portainer (Easiest!)**

1. **Complete this checklist**
2. **Follow the PORTAINER-GUIDE.md** for step-by-step instructions
3. **Test the deployment**:
   - Health check: `http://your_casaos_ip:8000/health`
   - API docs: `http://your_casaos_ip:8000/docs`

### 🔧 **Alternative: Using PowerShell Script**

1. **Complete this checklist**
2. **Edit your environment file**:
   ```powershell
   notepad .env.casaos
   ```
3. **Run the deployment script**:
   ```powershell
   .\deploy-to-casaos.ps1
   ```
4. **Test the deployment**:
   - Health check: `http://your_casaos_ip:8000/health`
   - API docs: `http://your_casaos_ip:8000/docs`

## After Deployment

### Update Frontend Configuration

1. Edit `frontend/.env.production`:

   ```
   VITE_API_BASE_URL=http://your_casaos_ip:8000/api
   ```

2. Rebuild and redeploy frontend:
   ```powershell
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```

### Test Full Application

- [ ] Login works from your deployed frontend
- [ ] Profile picture upload works
- [ ] Theme switching works and persists
- [ ] All API endpoints respond correctly

## Troubleshooting

If deployment fails:

1. Check CasaOS Docker logs: `docker-compose logs -f`
2. Verify environment variables are set correctly
3. Ensure all ports are available
4. Check file permissions on CasaOS
5. Verify SSH access and Docker permissions

Need help? Check the `CASAOS-DEPLOYMENT.md` file for detailed troubleshooting steps.
