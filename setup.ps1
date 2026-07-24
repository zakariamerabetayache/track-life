# Install PM2 globally if not present
npm install -g pm2

# Install backend dependencies
cd backend
npm install

# Generate Prisma Client and apply migrations
node ./node_modules/prisma/build/index.js generate
node ./node_modules/prisma/build/index.js migrate dev --name init

# Seed database
node prisma/seed.js

# Build frontend
cd ../frontend
npm install
npm run build

echo "Setup Complete! You can now run start-app.bat"
