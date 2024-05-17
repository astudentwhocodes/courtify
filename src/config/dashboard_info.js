// Import the necessary packages
const express = require('express');
const mysql = require('mysql2/promise');

// Create a router instance
const router = express.Router();

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12707087',
  password: 'tDTTLUjj5Y',
  database: 'sql12707087',
  port: 3306 // Port number
});

// Function to count users, courts, and bookings
async function countUsersCourtsAndBookings() {
  try {
    // Create SQL queries
    const queryCustomer = 'SELECT COUNT(*) AS totalCustomers FROM user_tb WHERE role = "customer"';
    const queryOwner = 'SELECT COUNT(*) AS totalOwners FROM user_tb WHERE role = "owner"';
    const queryCourts = 'SELECT COUNT(*) AS totalCourts FROM court_tb';
    const queryBookings = 'SELECT COUNT(*) AS totalBookings FROM booking_tb';

    // Execute queries in parallel
    const [customers, owners, courts, bookings] = await Promise.all([
      pool.query(queryCustomer),
      pool.query(queryOwner),
      pool.query(queryCourts),
      pool.query(queryBookings)
    ]);

    // Extract counts
    const totalCustomers = customers[0][0].totalCustomers;
    const totalOwners = owners[0][0].totalOwners;
    const totalCourts = courts[0][0].totalCourts;
    const totalBookings = bookings[0][0].totalBookings;

    return { totalCustomers, totalOwners, totalCourts, totalBookings };
  } catch (error) {
    console.error('Error counting:', error);
    throw error;
  }
}

// Define an endpoint to retrieve the total count of customers, owners, courts, and bookings
router.get('/countUsersCourtsAndBookings', async (req, res) => {
  try {
    const counts = await countUsersCourtsAndBookings();
    res.json(counts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the router
module.exports = router;
