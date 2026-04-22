module.exports = {
  apps: [
    {
      name: 'sisikita-api',
      cwd: '/home/admin/sisikita/sisikita-api',
      script: 'dist/src/main.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        APP_PORT: 3001,
      },
    },
  ],
};
