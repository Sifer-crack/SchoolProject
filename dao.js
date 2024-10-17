const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'lbccc_clubmembers',
    waitForConnections: true,
    connectionLimit: 10,
});

// Test the connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database');
        connection.release();
    } catch (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
        console.error('Error connecting to database:', err);
    }
})();

module.exports = pool;