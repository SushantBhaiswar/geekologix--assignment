const express = require('express');
const app = require('./app');
const { initDB } = require('./db');
const User = require('./models/user.model');
const logger = require('./config/logger');
const config = require('./config/config');

(async () => {
    try {
        // Initialize database and tables
        await initDB();
        await User.init();


        // Start the server
        const server = app.listen(config.port, () => {
            logger.info(`Assignment running on http://localhost:${config.port}`);
        });

        const exitHandler = () => {
            if (server) {
                server.close(() => {
                    logger.info('Server closed');
                    process.exit(1);
                });
            } else {
                process.exit(1);
            }
        };

        process.on('uncaughtException', (error) => {
            logger.error(error);
            exitHandler();
        });

        process.on('SIGTERM', () => {
            logger.info('SIGTERM received');
            if (server) server.close();
        });
    } catch (err) {
        console.error('Error during initialization:', err.message);
        process.exit(1);
    }
})();