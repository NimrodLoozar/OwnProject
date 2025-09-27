# Portainer Deployment Guide for OwnProject

## 🐳 Easy Docker Deployment with Portainer

Since you have Portainer installed, this is the **easiest way** to deploy your backend!

## Prerequisites

- ✅ Portainer is installed on CasaOS
- ✅ Your project files are ready

## Step-by-Step Instructions

### Step 1: Prepare Your Files

1. **Create project folder on CasaOS**

   - Use CasaOS File Manager to create: `/DATA/AppData/ownproject/`
   - OR via SSH: `mkdir -p /DATA/AppData/ownproject`

2. **Copy these files to the folder**:
   - `docker-compose.casaos.yml`
   - `.env.casaos` (rename to `.env`)
   - Entire `backend/` folder

### Step 2: Access Portainer

1. **Open Portainer in browser**:

   ```
   http://your-casaos-ip:9000
   ```

2. **Login with your Portainer credentials**

### Step 3: Create the Stack

1. **Navigate to Stacks**

   - Click "Stacks" in left sidebar
   - Click "➕ Add stack" button

2. **Configure the Stack**

   - **Name**: `ownproject`
   - **Build method**: Choose "Web editor"

3. **Add Docker Compose Content**
   Copy and paste this configuration:

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    container_name: ownproject-db
    environment:
      POSTGRES_DB: ownproject
      POSTGRES_USER: ownproject
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ownproject-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ownproject"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ownproject-backend
    environment:
      DATABASE_URL: postgresql://ownproject:${DB_PASSWORD}@db:5432/ownproject
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
    ports:
      - "8000:8000"
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/data:/app/data
    depends_on:
      db:
        condition: service_healthy
    networks:
      - ownproject-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  postgres_data:

networks:
  ownproject-network:
    driver: bridge
```

### Step 4: Set Environment Variables

1. **Scroll down to "Environment variables" section**

2. **Add these variables**:

   ```
   Name: DB_PASSWORD
   Value: your_secure_database_password_here

   Name: SECRET_KEY
   Value: your_super_secret_jwt_key_here
   ```

   **Generate secure values**:

   - DB Password: Use a strong password (20+ characters)
   - JWT Secret: Generate with `openssl rand -hex 32` or use online generator

### Step 5: Deploy the Stack

1. **Click "Deploy the stack"**
2. **Wait for deployment** (may take 2-5 minutes for first build)
3. **Check status** in the Stacks view

### Step 6: Run Database Migrations

1. **Go to Containers**

   - Click "Containers" in left sidebar
   - Find `ownproject-backend` container

2. **Open Console**

   - Click on the backend container name
   - Go to "Console" tab
   - Click "Connect" with `/bin/bash` command

3. **Run migrations**:
   ```bash
   python migrate_profile_fields.py
   python migrate_theme_system.py
   ```

### Step 7: Test Your Deployment

1. **Health Check**:

   ```
   http://your-casaos-ip:8000/health
   ```

2. **API Documentation**:

   ```
   http://your-casaos-ip:8000/docs
   ```

3. **Check in Portainer**:
   - Both containers should show "running" status
   - Logs should show no errors

## 🎉 Success! What's Next?

### Update Your Frontend

1. Edit `frontend/.env.production`:

   ```
   VITE_API_BASE_URL=http://your-casaos-ip:8000/api
   ```

2. Redeploy frontend:
   ```bash
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```

### Test Everything

- ✅ Login from your Firebase app
- ✅ Upload profile pictures
- ✅ Change themes
- ✅ All API endpoints work

## 🔧 Managing Your App in Portainer

### View Logs

1. Go to "Containers"
2. Click container name
3. Go to "Logs" tab

### Restart Services

1. Go to "Stacks" → "ownproject"
2. Click "Stop" then "Start"

### Update App

1. Go to "Stacks" → "ownproject"
2. Click "Editor"
3. Make changes and click "Update the stack"

### Monitor Resources

1. Go to "Host" in sidebar
2. View CPU, memory, storage usage

## 🚨 Troubleshooting

**Stack fails to deploy?**

- Check environment variables are set
- Ensure file paths are correct
- Check Portainer logs

**Containers not starting?**

- Verify port 8000 is available
- Check database password matches
- Look at container logs in Portainer

**Can't access API?**

- Check CasaOS firewall settings
- Verify containers are running
- Test with `curl http://localhost:8000/health` from CasaOS

Need more help? Check the main `CASAOS-DEPLOYMENT.md` file for detailed troubleshooting!
