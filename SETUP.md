# Wallet App Setup Guide

## Backend Server Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration (Required)
# Get your DATABASE_URL from Neon (https://neon.tech) or your PostgreSQL provider
DATABASE_URL=postgresql://user:password@host:port/database

# Server Configuration (Optional - defaults to 5002)
PORT=5002
NODE_ENV=development

# Upstash Redis Configuration (Optional - for rate limiting)
# Get these from https://upstash.com
# If not provided, rate limiting will be disabled in development mode
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 3. Start the Backend Server

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

The server should start on port 5002 (or your configured PORT) and display connection information.

### 4. Verify Server is Running

Open your browser and visit:
- `http://localhost:5002/api/health` - Should return `{"status":"ok"}`

## Mobile App Setup

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure API URL

Edit `mobile/constants/api.js` and update the `API_URL` with your computer's IP address:

1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in PowerShell/CMD, look for "IPv4 Address"
   - **Mac/Linux**: Run `ifconfig` or `ip addr`, look for inet address

2. Update the API_URL:
   ```javascript
   export const API_URL = "http://YOUR_IP_ADDRESS:5002/api";
   ```

   Example:
   ```javascript
   export const API_URL = "http://192.168.0.100:5002/api";
   ```

### 3. Start the Mobile App

```bash
cd mobile
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your physical device

## Troubleshooting

### "Network request failed" Error

1. **Check if backend server is running**
   - Look for the server startup message in the terminal
   - Test: Open `http://YOUR_IP:5002/api/health` in a browser

2. **Verify IP address**
   - Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Make sure the IP in `mobile/constants/api.js` matches your current IP
   - IP addresses can change when you reconnect to Wi-Fi

3. **Check network connectivity**
   - Ensure both your computer and mobile device are on the **same Wi-Fi network**
   - Try pinging your computer's IP from the mobile device

4. **Firewall issues**
   - Windows: Check if Windows Firewall is blocking port 5002
   - Add an exception for Node.js or port 5002

5. **Database connection**
   - Make sure `DATABASE_URL` is set correctly in `backend/.env`
   - The server will show an error if the database connection fails

### Server won't start

1. Check if port 5002 is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :5002
   
   # Mac/Linux
   lsof -i :5002
   ```

2. Verify environment variables are set:
   - Check that `DATABASE_URL` exists in `backend/.env`
   - The server needs this to initialize the database

3. Check server logs for specific error messages

## Quick Start Checklist

- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] `.env` file created in `backend/` with `DATABASE_URL`
- [ ] Backend server running (`cd backend && npm start`)
- [ ] Server health check works (`http://localhost:5002/api/health`)
- [ ] Mobile dependencies installed (`cd mobile && npm install`)
- [ ] API URL updated in `mobile/constants/api.js` with correct IP
- [ ] Mobile app started (`cd mobile && npm start`)
- [ ] Both devices on same Wi-Fi network

