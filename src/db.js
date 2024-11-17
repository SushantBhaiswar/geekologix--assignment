const mysql = require('mysql2/promise');
const logger = require('./config/logger.js');
const config = require('./config/config.js')

// Update config keys for MySQL/MSSQL
const dbConfig = {
    host: config.database.HOST,
    user: config.database.USER,
    password: config.database.PASSWORD,
    database: config.database.DATABASE_NAME,
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
