const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12707087',
    password: 'tDTTLUjj5Y',
    database: 'sql12707087',
    port: 3306 // Port number
});

// POST route for adding booking data to the database
router.post('/', async (req, res) => {
    try {
        const { user_id, court_id, booking_date, booking_price } = req.body;

        // Check if all required fields are provided
        if (!user_id || !court_id || !booking_date || !booking_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Insert data into the database
        const connection = await pool.getConnection();
        try {
            await connection.query('INSERT INTO booking_tb (user_id, court_id, booking_date, booking_price) VALUES (?, ?, ?, ?)', [user_id, court_id, booking_date, booking_price]);
            res.status(201).json({ message: 'Booking added successfully' });
        } finally {
            connection.release(); // Release the connection back to the pool
        }
    } catch (error) {
        console.error('Error adding booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST route for pending bookings
router.post('/pending', async (req, res) => {
    try {
        const { user_id, court_id, time_slots } = req.body;

        // Check if all required fields are provided
        if (!user_id || !court_id || !time_slots) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Split the time_slots string into an array of individual time slots
        const individualTimeSlots = time_slots.split(',');

        // Begin a transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert each time slot into the database for pending bookings
            for (const slot of individualTimeSlots) {
                // Insert data into the database for each time slot
                await connection.query('INSERT INTO booking_pending_tb (user_id, court_id, time_slot) VALUES (?, ?, ?)', [user_id, court_id, slot]);
            }

            // Update the availability of the court to 2 for each time slot
            for (const slot of individualTimeSlots) {
                await connection.query('UPDATE court_availability_tb SET availability = 2 WHERE court_id = ? AND time_slot = ?', [court_id, slot]);
            }

            // Commit the transaction
            await connection.commit();

            res.status(201).json({ message: 'Booking pending successfully' });
        } catch (error) {
            // Rollback the transaction if an error occurs
            await connection.rollback();
            throw error;
        } finally {
            connection.release(); // Release the connection back to the pool
        }
    } catch (error) {
        console.error('Error adding pending booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/info/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        // Retrieve booking information from the database for the specified user ID
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query('SELECT * FROM booking_tb WHERE user_id = ?', [user_id]);
            res.status(200).json({ bookings: rows });
        } finally {
            connection.release(); // Release the connection back to the pool
        }
    } catch (error) {
        console.error('Error retrieving booking information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:court_id', async (req, res) => {
    try {
        const { court_id } = req.params;

        // Retrieve booking information from the database for the specified court ID
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query('SELECT * FROM booking_tb WHERE court_id = ?', [court_id]);
            res.status(200).json({ bookings: rows });
        } finally {
            connection.release(); // Release the connection back to the pool
        }
    } catch (error) {
        console.error('Error retrieving booking information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/info/:court_id/:user_id', async (req, res) => {
    try {
        const { court_id, user_id } = req.params;

        // Retrieve booking information from the database for the specified court ID and user ID
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query('SELECT * FROM booking_tb WHERE court_id = ? AND user_id = ?', [court_id, user_id]);
            res.status(200).json({ bookings: rows });
        } finally {
            connection.release(); // Release the connection back to the pool
        }
    } catch (error) {
        console.error('Error retrieving booking information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.delete('/delete/:court_id', async (req, res) => {
    try {
        const { court_id } = req.params;

        // Begin a transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Delete records from booking_tb
            await connection.query('DELETE FROM booking_tb WHERE court_id = ?', [court_id]);

            // Retrieve time slots that were changed to availability 2 for the specified court
            const [affectedRows] = await connection.query('SELECT time_slot FROM court_availability_tb WHERE court_id = ? AND availability = 2', [court_id]);

            // Update the availability back to 1 for each time slot
            for (const row of affectedRows) {
                const { time_slot } = row;
                await connection.query('UPDATE court_availability_tb SET availability = 1 WHERE court_id = ? AND time_slot = ?', [court_id, time_slot]);
            }

            // Delete records from booking_pending_tb
            await connection.query('DELETE FROM booking_pending_tb WHERE court_id = ?', [court_id]);

            // Commit the transaction
            await connection.commit();

            res.status(200).json({ message: 'Records deleted successfully and availability reverted' });
        } catch (error) {
            // Rollback the transaction if an error occurs
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error deleting records:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/accept/:court_id/:user_id', async (req, res) => {
    try {
        const { court_id, user_id } = req.params;

        // Begin a transaction
        console.log("c="+court_id);
        console.log("u="+user_id);
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Retrieve the time slots for pending bookings
            const [pendingRows] = await connection.query('SELECT time_slot FROM booking_pending_tb WHERE court_id = ? AND user_id = ?', [court_id, user_id]);

            // Revert the availability status to 1 for each time slot in court_availability_tb
            for (const row of pendingRows) {
                const { time_slot } = row;
                await connection.query('UPDATE court_availability_tb SET availability = 3 WHERE court_id = ? AND time_slot = ?', [court_id, time_slot]);
            }

            // Update the status of the booking to 1 (Booked) for the specified court and user
            await connection.query('UPDATE booking_tb SET status = 1 WHERE court_id = ? AND user_id = ?', [court_id, user_id]);

            // Delete records from booking_pending_tb for the specified court and user
            await connection.query('DELETE FROM booking_pending_tb WHERE court_id = ? AND user_id = ?', [court_id, user_id]);

            // Commit the transaction
            await connection.commit();

            res.status(200).json({ message: 'Booking accepted successfully' });
        } catch (error) {
            // Rollback the transaction if an error occurs
            await connection.rollback();
            throw error;
        } finally {
            connection.release(); // Release the connection back to the pool
        }
    } catch (error) {
        console.error('Error accepting booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/decline/:court_id/:user_id', async (req, res) => {
    try {
        const { court_id, user_id } = req.params;

        // Begin a transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Retrieve the time slots for pending bookings
            const [pendingRows] = await connection.query('SELECT time_slot FROM booking_pending_tb WHERE court_id = ? AND user_id = ?', [court_id, user_id]);

            // Revert the availability status to 1 for each time slot in court_availability_tb
            for (const row of pendingRows) {
                const { time_slot } = row;
                await connection.query('UPDATE court_availability_tb SET availability = 1 WHERE court_id = ? AND time_slot = ?', [court_id, time_slot]);
            }

            // Delete records from booking_tb for the specified court and user
            await connection.query('DELETE FROM booking_tb WHERE court_id = ? AND user_id = ?', [court_id, user_id]);

            // Delete records from booking_pending_tb for the specified court and user
            await connection.query('DELETE FROM booking_pending_tb WHERE court_id = ? AND user_id = ?', [court_id, user_id]);

            // Commit the transaction
            await connection.commit();

            res.status(200).json({ message: 'Booking declined successfully' });
        } catch (error) {
            // Rollback the transaction if an error occurs
            await connection.rollback();
            throw error;
        } finally {
            connection.release(); // Release the connection back to the pool
        }
    } catch (error) {
        console.error('Error declining booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
