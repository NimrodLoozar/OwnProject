# CasaOS Deployment Guide for OwnProject

## Prerequisites

- CasaOS installed and running
- Docker and Docker Compose installed on CasaOS
- Access to CasaOS web interface
- Basic knowledge of CasaOS app management

## Step-by-Step Deployment Instructions

### Step 1: Prepare Your CasaOS Environment

1. **Access CasaOS Dashboard**

   - Open your browser and go to your CasaOS IP address
   - Login to your CasaOS dashboard

2. **Enable Docker (if not already enabled)**
   - Go to App Store in CasaOS
   - Install Docker if not already installed
   - Make sure Docker service is running

### Step 2: Upload Project Files to CasaOS

1. **Create Project Directory**

   - SSH into your CasaOS system OR use the file manager
   - Create a directory: `/opt/ownproject/` or use CasaOS file manager

2. **Upload These Files to CasaOS**
   - `docker-compose.casaos.yml`
   - `.env.casaos` (rename to `.env`)
   - Entire `backend/` folder
   - `migrate_profile_fields.py`
   - `migrate_theme_system.py`

### Step 3: Configure Environment Variables

1. **Edit .env file on CasaOS**
   ```bash
   # Change these values!
   DB_PASSWORD=your_very_secure_password_123
   SECRET_KEY=your-super-long-secret-key-at-least-32-characters
   ```

### Step 4: Deploy Using Portainer (Recommended)

#### Option A: Using Portainer Web Interface (Easiest!)

1. **Access Portainer**

   - Open Portainer in your browser: `http://your-casaos-ip:9000`
   - Login to Portainer dashboard

2. **Create New Stack**

   - Go to "Stacks" in the left menu
   - Click "Add stack"
   - Name it: `ownproject`

3. **Upload Docker Compose**

   - In the "Web editor" tab, copy and paste the contents of `docker-compose.casaos.yml`
   - OR use "Upload" tab and upload your `docker-compose.casaos.yml` file

4. **Set Environment Variables**

   - Scroll down to "Environment variables"
   - Add your variables from `.env.casaos`:
     ```
     DB_PASSWORD=your_secure_password
     POSTGRES_PASSWORD=your_secure_password
     SECRET_KEY=your_jwt_secret
     ```

5. **Deploy Stack**
   - Click "Deploy the stack"
   - Wait for containers to build and start

#### Option B: Using Terminal/SSH (Alternative)

1. **SSH into CasaOS**

   ```bash
   ssh your-casaos-username@your-casaos-ip
   ```

2. **Navigate to project directory**

   ```bash
   cd /opt/ownproject
   ```

3. **Build and start services**
   ```bash
   docker-compose -f docker-compose.casaos.yml up -d --build
   ```

### Step 5: Run Database Migrations

#### Using Portainer (Recommended)

1. **Go to Containers in Portainer**

   - Navigate to "Containers" in Portainer
   - Find the `ownproject-backend` container

2. **Open Container Console**

   - Click on the backend container
   - Go to "Console" tab
   - Click "Connect" to open terminal

3. **Run Migrations**

   ```bash
   # Run the profile fields migration
   python migrate_profile_fields.py

   # Run the theme system migration
   python migrate_theme_system.py
   ```

#### Using SSH (Alternative)

1. **After containers are running, run migrations**

   ```bash
   # Run the profile fields migration
   docker exec -it ownproject-backend python migrate_profile_fields.py

   # Run the theme system migration
   docker exec -it ownproject-backend python migrate_theme_system.py
   ```

### Step 6: Configure CasaOS App Dashboard

1. **Add to CasaOS Dashboard**
   - In CasaOS, go to "Custom Apps" or "My Apps"
   - Add your backend with URL: `http://your-casaos-ip:8000`
   - Set app name: "OwnProject Backend"
   - Set icon and description

### Step 7: Configure Domain and SSL (Optional)

If you want to expose your app to the internet:

1. **Setup Domain**

   - Point your domain to your CasaOS IP
   - Configure port forwarding for ports 8000

2. **Setup SSL with Nginx Proxy Manager**
   - Install Nginx Proxy Manager from CasaOS App Store
   - Create proxy host for your domain pointing to `ownproject-backend:8000`
   - Enable SSL certificate

### Step 8: Update Frontend Configuration

1. **Update Frontend Environment**

   - Edit `frontend/.env.production`
   - Set `VITE_API_BASE_URL=http://your-casaos-ip:8000/api`
   - Or use your domain: `https://your-domain.com/api`

2. **Redeploy Frontend**
   ```bash
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```

## Important Security Notes

1. **Change Default Passwords**: Always change the default database password
2. **Secret Key**: Generate a secure secret key for JWT tokens
3. **Firewall**: Configure CasaOS firewall to only expose necessary ports
4. **Updates**: Regularly update your containers and CasaOS

## Monitoring and Maintenance

### Using Portainer (Recommended)

1. **Check Container Status**

   - Go to "Containers" in Portainer
   - View real-time status of all containers

2. **View Logs**

   - Click on any container in Portainer
   - Go to "Logs" tab to view live logs

3. **Monitor Resources**

   - Go to "Host" → "Setup" to see resource usage
   - Monitor CPU, memory, and storage

4. **Update Application**
   - Go to "Stacks" → "ownproject"
   - Click "Editor" to update docker-compose
   - Click "Update the stack"

### Using Terminal (Alternative)

1. **Check Container Status**

   ```bash
   docker-compose -f docker-compose.casaos.yml ps
   ```

2. **View Logs**

   ```bash
   docker-compose -f docker-compose.casaos.yml logs -f
   ```

3. **Update Application**
   ```bash
   docker-compose -f docker-compose.casaos.yml pull
   docker-compose -f docker-compose.casaos.yml up -d
   ```

## Backup Strategy

1. **Database Backup**

   ```bash
   docker exec ownproject-db pg_dump -U ownproject ownproject > backup.sql
   ```

2. **Uploads Backup**
   ```bash
   docker cp ownproject-backend:/app/uploads ./uploads-backup
   ```

## Troubleshooting

- **Port Conflicts**: Change ports in docker-compose.casaos.yml if needed
- **Permission Issues**: Ensure CasaOS user has proper Docker permissions
- **Memory Issues**: Monitor CasaOS resource usage
- **Network Issues**: Check CasaOS network configuration

## Next Steps After Deployment

1. Test all functionality (login, profile pictures, theme switching)
2. Set up monitoring and alerting
3. Configure automated backups
4. Set up SSL certificates for security
5. Update frontend with production backend URL
