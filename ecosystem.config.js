module.exports = {
    apps: [
        {
            name: 'device-monitor-backend',
            cwd: './backend',
            script: 'dist/index.js',
            env: {
                NODE_ENV: 'production'
            },
            watch: false,
            instances: 1,
            autorestart: true,
            max_restarts: 10
        },
        {
            name: 'device-monitor-frontend',
            cwd: './frontend',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            watch: false,
            instances: 1,
            autorestart: true,
            max_restarts: 10
        }
    ]
};
