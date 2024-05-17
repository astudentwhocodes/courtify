// Import the necessary packages
const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2/promise for async/await support
// Create a router instance
const router = express.Router();

// Create a connection to the MySQL database
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12707087',
  password: 'tDTTLUjj5Y',
  database: 'sql12707087',
  port: 3306 // Port number
});

// Retrieve user information based on user_id
async function getUserInfo(user_id) {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Create SQL query to fetch user information
    const query = 'SELECT * FROM user_tb WHERE user_id = ?';

    // Execute the query using the connection
    const [results] = await connection.query(query, [user_id]);

    // Release the connection back to the pool
    connection.release();

    // Handle the results
    if (results.length > 0) {
      return results[0];
    } else {
      console.log('User not found');
      return {};
    }
  } catch (error) {
    console.error('Error retrieving user information:', error);
    throw error;
  }
}

// Define an endpoint to retrieve user information
router.get('/:user_id', async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const userInfo = await getUserInfo(user_id);
    res.json(userInfo);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the router
module.exports = router;