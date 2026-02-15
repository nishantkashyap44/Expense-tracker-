# 🚀 Expense Tracker Pro - Complete Setup Guide

This guide will walk you through setting up the Expense Tracker Pro application from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v16.0.0 or higher)
  - Download from: https://nodejs.org/
  - Verify: `node --version`

- **npm** (v8.0.0 or higher)
  - Comes with Node.js
  - Verify: `npm --version`

- **MySQL** (v5.7 or higher)
  - Download from: https://dev.mysql.com/downloads/
  - Verify: `mysql --version`

### Optional but Recommended
- **Git** for version control
- **Postman** or **Insomnia** for API testing
- **VS Code** or any code editor

## Installation Steps

### Step 1: Download/Clone the Project

```bash
# If you have the zip file
unzip expense-tracker-pro.zip
cd expense-tracker-pro

# Or if using Git
git clone <repository-url>
cd expense-tracker-pro
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- jsonwebtoken
- bcryptjs
- helmet
- cors
- express-validator
- express-rate-limit
- compression
- morgan
- dotenv

## Database Setup

### Step 1: Create MySQL Database

#### Option A: Using MySQL Command Line

```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source database/schema.sql

# Or if that doesn't work
\. database/schema.sql

# Exit MySQL
exit
```

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Go to File > Run SQL Script
4. Select `database/schema.sql`
5. Execute the script

### Step 2: Verify Database Creation

```sql
-- Login to MySQL
mysql -u root -p

-- Check database
SHOW DATABASES;
USE expense_tracker;

-- Check tables
SHOW TABLES;

-- You should see:
-- budgets
-- categories
-- expenses
-- users
-- wallet_transactions
-- wallets
```

## Configuration

### Step 1: Create Environment File

```bash
# Copy the example file
cp .env.example .env

# Or create manually
touch .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file with your settings:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=nishant@20
DB_NAME=expense_tracker
DB_PORT=3306

# JWT Configuration
# IMPORTANT: Use a strong secret key in production
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=24h

# CORS Configuration
CLIENT_URL=http://localhost:5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Important Notes:

1. **JWT_SECRET**: Should be a random, long string (32+ characters)
   - Generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. **DB_PASSWORD**: Your MySQL root password or user password

3. **CLIENT_URL**: 
   - Development: `http://localhost:5000`
   - Production: Your actual domain

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

This will:
- Start the server on port 5000 (or your configured PORT)
- Watch for file changes and auto-restart
- Enable detailed logging

### Production Mode

```bash
npm start
```

This will:
- Start the server in production mode
- Use optimized settings
- Disable verbose logging

### Verify Server is Running

You should see:
```
✅ Database connected successfully
🚀 Server running in development mode on port 5000
```

## Testing

### Step 1: Access the Application

Open your browser and navigate to:
```
http://localhost:5000/login.html
```

### Step 2: Create a Test Account

1. Click "Sign up" link
2. Fill in registration form:
   - Name: Test User
   - Email: nishu@example.com
   - Password: Nishu@123 (must include uppercase, lowercase, and number)
3. Click "Sign Up"

### Step 3: Login

1. Use the credentials you just created
2. Email: nishu@example.com
3. Password: Nest@123
4. Click "Sign In"

### Step 4: Explore Dashboard

You should now see:
- Dashboard with stats cards (will show $0 initially)
- Empty transaction list
- Empty budget list
- Empty charts

### Step 5: Test API Endpoints (Optional)

Use Postman or curl to test API endpoints:

```bash
# Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Test@123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test@123"
  }'

# Get Dashboard (replace YOUR_TOKEN with actual token from login)
curl http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Deployment

### Preparing for Production

1. **Update Environment Variables**
```env
NODE_ENV=production
JWT_SECRET=<generate-new-strong-secret>
CLIENT_URL=https://yourdomain.com
```

2. **Build Checklist**
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Secure database password
- [ ] Configure CORS with actual domain
- [ ] Enable SSL/HTTPS
- [ ] Set up database backups
- [ ] Configure logging

### Deployment Options

#### Option 1: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start src/server.js --name expense-tracker

# View logs
pm2 logs expense-tracker

# Monitor
pm2 monit

# Save configuration
pm2 save

# Set up auto-restart on reboot
pm2 startup
```

#### Option 2: Using Docker

```dockerfile
# Create Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Build image
docker build -t expense-tracker .

# Run container
docker run -p 5000:5000 --env-file .env expense-tracker
```

#### Option 3: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MySQL addon
heroku addons:create cleardb:ignite

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Setting up Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error:** `Database connection failed: Access denied`

**Solution:**
```bash
# Verify MySQL is running
mysql --version

# Check credentials in .env file
# Make sure DB_USER and DB_PASSWORD are correct

# Try connecting manually
mysql -u root -p
```

#### 2. Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Find process using port 5000
# On macOS/Linux
lsof -i :5000

# On Windows
netstat -ano | findstr :5000

# Kill the process or change PORT in .env
```

#### 3. JWT Token Invalid

**Error:** `Invalid token` or `Token expired`

**Solution:**
- Clear browser localStorage
- Logout and login again
- Check JWT_SECRET is same across restarts

#### 4. CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution:**
```env
# Update CLIENT_URL in .env
CLIENT_URL=http://localhost:3000

# Or allow all origins in development (not recommended for production)
CLIENT_URL=*
```

#### 5. Dependencies Installation Failed

**Error:** `npm ERR!` during installation

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Getting Help

If you encounter issues:

1. Check the console/terminal for error messages
2. Review the logs: `npm run dev` shows detailed logs
3. Verify all environment variables are set correctly
4. Check MySQL is running and accessible
5. Ensure all dependencies are installed

### Database Issues

```bash
# Reset database
mysql -u root -p < database/schema.sql

# Check table structure
mysql -u root -p -e "DESCRIBE expense_tracker.users"

# View database logs
# Location varies by OS - check MySQL documentation
```

## Next Steps

After successful setup:

1. **Customize the Application**
   - Update branding (logo, colors)
   - Add more features
   - Customize categories

2. **Set Up Monitoring**
   - Use PM2 for process monitoring
   - Set up log aggregation
   - Configure alerts

3. **Implement Backups**
   - Schedule database backups
   - Set up automated backups

4. **Security Hardening**
   - Enable HTTPS
   - Configure firewall
   - Set up intrusion detection

5. **Performance Optimization**
   - Enable caching
   - Optimize database queries
   - Use CDN for static assets

## Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT.io](https://jwt.io/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

**Need Help?**
- Create an issue on GitHub
- Check documentation
- Review error logs

**Happy Tracking! 💰**
