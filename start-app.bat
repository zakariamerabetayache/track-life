@echo off
echo Starting Truck Life App...
pm2 start ecosystem.config.js
pm2 save
pm2 startup
echo App started! You can access it at http://localhost:3000
pause
