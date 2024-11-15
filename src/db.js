const mysql = require('mysql2/promise');
const logger = require('./config/logger.js');

// Update config keys for MySQL/MSSQL
const dbConfig = {
    host: 'localhost', // Use 'host' instead of 'server'
    user: 'root',
    password: '12345678',
    database: 'user_managment',
};

// Function to initialize database
const initDB = async () => {
    try {
        // Connect without database to create it if it doesn't exist
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await connection.end();
        logger.info(`Database initialized successfully.`);

    } catch (err) {
        console.error('Error initializing database:', err.message);
        throw err;
    }
};

// Create a connection pool for application queries
const pool = mysql.createPool(dbConfig);

const query = async (sql, params) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
};

module.exports = { initDB, query };
