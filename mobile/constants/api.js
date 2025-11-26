//export const API_URL = "https://wallet-api-cxqp.onrender.com/api";
//export const API_URL = "https://money-map-84sq.onrender.com/api";

// For local development, use your computer's IP address instead of localhost
// IMPORTANT: Make sure your mobile device and computer are on the SAME network.
//
// To find your IP address:
//   - Windows: Run 'ipconfig' in PowerShell/CMD, look for "IPv4 Address"
//   - Mac/Linux: Run 'ifconfig' or 'ip addr', look for inet address
//
// The server runs on port 5003 by default (check your backend .env file for PORT).
// Update the IP address below with your current IP:
const LOCAL_API_URL = "http://192.168.0.102:5003/api";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || LOCAL_API_URL;

// Troubleshooting:
// 1. Make sure the backend server is running (cd backend && npm start)
// 2. Verify the IP address matches your computer's current IP
// 3. Ensure both devices are on the same Wi-Fi network
// 4. Check Windows Firewall isn't blocking the server port
// 5. Test connection: Open http://YOUR_IP:5003/api/health in a browser
