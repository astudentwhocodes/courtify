const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2/promise for async/await support
const router = express.Router();

const pool = mysql.createPool({
    connectionLimit: 20,
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12707087',
    password: 'tDTTLUjj5Y',
    database: 'sql12707087',
    port: 3306 // Port number
});

router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const connection = await pool.getConnection();
        const [results] = await connection.execute('SELECT user_id, username, password FROM user_tb WHERE email = ?', [email]);
        connection.release();

        if (results.length > 0) {
            const user = results[0];
            if (user.password === password) {
                return res.status(200).json({ message: 'Login successful.', user_id: user.user_id });
            } else {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
        } else {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/signup', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const join_date = req.body.join_date; // New parameter for join_date

    if (!username || !email || !password || !role || !join_date) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.execute('INSERT INTO user_tb (username, email, password, role, join_date) VALUES (?, ?, ?, ?, ?)', [username, email, password, role, join_date]); // Updated query to include join_date
        connection.release();
        return res.status(200).json({ message: 'Signup successful.' });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.delete('/delete/:user_id', async (req, res) => {
    const userId = req.params.user_id;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM user_tb WHERE user_id = ?', [userId]);
        connection.release();

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'User deleted successfully.' });
        } else {
            return res.status(404).json({ error: 'User not found.' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


router.get('/user/customer', async (req, res) => {
    try {
        // Get a connection from the pool
        const connection = await pool.getConnection();

        // Create SQL query to fetch all customer information
        const query = 'SELECT * FROM user_tb WHERE role = "customer"';

        // Execute the query using the connection
        const [results] = await connection.query(query);

        // Release the connection back to the pool
        connection.release();

        // Handle the results
        if (results.length > 0) {
            res.json(results);
        } else {
            console.log('No customers found');
            res.json([]);
        }
    } catch (error) {
        console.error('Error retrieving customer information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/user/owner', async (req, res) => {
    try {
        // Get a connection from the pool
        const connection = await pool.getConnection();

        // Create SQL query to fetch all customer information
        const query = 'SELECT * FROM user_tb WHERE role = "owner"';

        // Execute the query using the connection
        const [results] = await connection.query(query);

        // Release the connection back to the pool
        connection.release();

        // Handle the results
        if (results.length > 0) {
            res.json(results);
        } else {
            console.log('No owners found');
            res.json([]);
        }
    } catch (error) {
        console.error('Error retrieving owner information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/update/:user_id', async (req, res) => {
    const userId = req.params.user_id; // Retrieve user ID from URL parameters
    const fullname = req.body.fullname;
    const address = req.body.address;
    const about = req.body.about;

    if (!userId || (!fullname && !address && !about)) {
        return res.status(400).json({ error: 'User ID and at least one field to update are required.' });
    }

    try {
        const connection = await pool.getConnection();
        let query = 'UPDATE user_tb SET';
        const values = [];

        if (fullname) {
            query += ' fullname = ?,';
            values.push(fullname);
        }

        if (address) {
            query += ' address = ?,';
            values.push(address);
        }

        if (about) {
            query += ' about = ?,';
            values.push(about);
        }

        // Remove the trailing comma and add the WHERE clause
        query = query.slice(0, -1) + ' WHERE user_id = ?';
        values.push(userId);

        // Execute the query
        await connection.execute(query, values);
        connection.release();

        return res.status(200).json({ message: 'User information updated successfully.' });
    } catch (error) {
        console.error('Error updating user information:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


module.exports = router;
