const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2/promise for async/await support
const router = express.Router();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'sql6.freemysqlhosting.net',
    user: 'sql6705169',
    password: 'lafXyFPRFm',
    database: 'sql6705169',
    port: 3306 // Port number
  });

router.post('/addcourt', async (req, res) => {
    const courtName = req.body.court_name;
    const address = req.body.address;
    const price = req.body.price;
    const userId = req.body.user_id;
    const about = req.body.about; // Extract about from request body
    const photo = req.body.photo; // Extract photo from request body

    if (!courtName || !address || !price || !userId || !photo) {
        return res.status(400).json({ error: 'Court name, address, price, user ID, and photo are required.' });
    }

    try {
        const connection = await pool.getConnection();
        // Insert court details into court_tb with user_id and photo
        const [result] = await connection.execute('INSERT INTO court_tb (court_name, address, price, user_id, about, photo, availability) VALUES (?, ?, ?, ?, ?, ?, ?)', [courtName, address, price, userId, about, photo, 1]);
        const courtId = result.insertId; // Get the inserted court ID
        connection.release();
        return res.status(200).json({ message: 'Court added successfully.', court_id: courtId });
    } catch (error) {
        console.error('Error adding court:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});




// Endpoint to add availability for a court
router.post('/addavailability', async (req, res) => {
    const courtId = req.body.court_id;
    const timeSlots = req.body.time_slots || [];

    if (!courtId) {
        return res.status(400).json({ error: 'Court ID is required.' });
    }

    try {
        const connection = await pool.getConnection();
        
        // Check if the court exists
        const [courtRows] = await connection.execute('SELECT * FROM court_tb WHERE court_id = ?', [courtId]);
        if (courtRows.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Court not found.' });
        }
        
        // Prepare the placeholders for SQL query
        const placeholders = timeSlots.map(() => '(?, ?)').join(',');
        const values = timeSlots.reduce((acc, timeSlot) => {
            acc.push(courtId, timeSlot);
            return acc;
        }, []);
        
        // Insert availability records into court_availability_tb
        const sql = `INSERT INTO court_availability_tb (court_id, time_slot) VALUES ${placeholders}`;
        await connection.execute(sql, values);
        
        connection.release();
        return res.status(200).json({ message: 'Availability added successfully.' });
    } catch (error) {
        console.error('Error adding availability:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.delete('/deletecourt/:user_id', async (req, res) => {
    const userId = req.params.user_id;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        const connection = await pool.getConnection();

        // Check if the user exists
        const [userRows] = await connection.execute('SELECT * FROM user_tb WHERE user_id = ?', [userId]);
        if (userRows.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'User not found.' });
        }

        // Begin transaction
        await connection.beginTransaction();

        // Delete courts associated with the user
        await connection.execute('DELETE FROM court_tb WHERE user_id = ?', [userId]);

        // Delete court_id from court_availability_tb
        await connection.execute('DELETE FROM court_availability_tb WHERE court_id NOT IN (SELECT court_id FROM court_tb)');

        // Commit transaction
        await connection.commit();

        connection.release();
        return res.status(200).json({ message: 'Courts deleted successfully.' });
    } catch (error) {
        console.error('Error deleting courts:', error);
        // Rollback transaction on error
        await connection.rollback();
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.delete('/deletecourtid/:court_id', async (req, res) => {
    const courtId = req.params.court_id;

    if (!courtId) {
        return res.status(400).json({ error: 'Court ID is required.' });
    }

    try {
        const connection = await pool.getConnection();

        // Check if the court exists
        const [courtRows] = await connection.execute('SELECT * FROM court_tb WHERE court_id = ?', [courtId]);
        if (courtRows.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Court not found.' });
        }

        // Begin transaction
        await connection.beginTransaction();

        // Delete the court
        await connection.execute('DELETE FROM court_tb WHERE court_id = ?', [courtId]);

        // Delete court_id from court_availability_tb
        await connection.execute('DELETE FROM court_availability_tb WHERE court_id = ?', [courtId]);

        // Commit transaction
        await connection.commit();

        connection.release();
        return res.status(200).json({ message: 'Court deleted successfully.' });
    } catch (error) {
        console.error('Error deleting court:', error);
        // Rollback transaction on error
        await connection.rollback();
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


module.exports = router;
