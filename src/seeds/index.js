/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable no-console */

const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');

let envFile = ".env";


dotenv.config({ path: path.join(__dirname, `../../${envFile}`) });


const adminSeeder = require('./admin.seeds');

// Database connection config
const envVars = process.env;

const dbConfig = {
    host: envVars.HOSt,
    user: envVars.USER,
    password: envVars.PASSWORD,
    database: envVars.DATABASE_NAME,
};

// Initialize the database connection
const initDbConnection = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to the SQL Database!');

      

        return connection;
    } catch (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
};

// Main seeding function
const runSeeders = async () => {
    const connection = await initDbConnection();

    try {
        await adminSeeder.run(connection);
      
        console.log('Database seeded successfully!');
    } catch (err) {
        console.error('Error running seeders:', err);
    } finally {
        await connection.end();
        console.log('Connection closed!');
        process.exit(0);
    }
};

runSeeders();
