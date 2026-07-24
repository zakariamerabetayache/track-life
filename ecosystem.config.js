module.exports = {
  apps: [
    {
      name: "trucklife-backend",
      script: "src/index.js",
      cwd: "./backend",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    },
    {
      name: "trucklife-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "./frontend",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
