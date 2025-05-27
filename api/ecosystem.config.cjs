module.exports = {
  apps: [
    {
      name: "api-game",
      script: "./server.js",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        BASE_URL_USERS: "https://192.168.75.33:8443/users",
      },
    },
  ],
};
