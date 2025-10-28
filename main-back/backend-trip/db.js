/**
 * Database configuration for MySQL connection
 * Uses mysql2 with promise support for async/await syntax
 * 
 * Installation: npm install mysql2
 */

const mysql = require('mysql2/promise');

// Database configuration
// TODO: Move these to environment variables (.env file)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trip_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable timezone handling
  timezone: '+00:00',
  // Enable JSON parsing
  supportBigNumbers: true,
  bigNumberStrings: true,
};

// Create connection pool (better for performance than single connection)
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query results
 */
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
}

/**
 * Close all connections in the pool
 * Call this when shutting down the server
 */
async function closePool() {
  try {
    await pool.end();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error.message);
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  closePool,
};
