module.exports = {
  apps: [
    {
      name: "crm-backend-master",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5501
      }
    }
  ]
};
