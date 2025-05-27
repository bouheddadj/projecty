module.exports = {
  apps: [
    {
      name: "api-game",
      script: "./server.js",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
