module.exports = {
  apps: [
    {
      name: "server",
      script: "./dist/index.js",
      interpreter: "bun",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
      },
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      name: "server-dev",
      script: "./src/index.ts",
      interpreter: "bun",
      instances: 1,
      exec_mode: "fork",
      watch: ["./src"],
      ignore_watch: ["node_modules", "logs", "dist", "uploads", ".git"],
      env: {
        NODE_ENV: "development",
      },
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
