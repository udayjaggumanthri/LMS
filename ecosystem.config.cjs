const path = require('path');

const root = __dirname;

module.exports = {
  apps: [
    {
      name: 'lms-backend',
      cwd: path.join(root, 'backend'),
      script: path.join(root, 'backend', 'venv', 'bin', 'gunicorn'),
      args: '--workers 3 --bind 127.0.0.1:8010 --timeout 60 config.wsgi:application',
      interpreter: 'none',
      autorestart: true,
      max_restarts: 15,
      min_uptime: '10s',
    },
    {
      name: 'lms-frontend',
      cwd: path.join(root, 'frontend'),
      script: path.join(root, 'frontend', 'node_modules', 'serve', 'build', 'main.js'),
      interpreter: 'node',
      args: ['-s', 'dist', '-l', 'tcp://127.0.0.1:3012'],
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
