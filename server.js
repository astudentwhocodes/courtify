const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path'); 
const fs = require('fs'); // Import the 'fs' module

// Import user routes
const userRoutes = require('./config/user');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'sql6.freemysqlhosting.net',
    user: 'sql6705169',
    password: 'lafXyFPRFm',
    database: 'courtify',
    port: 3306 // Port number
});

// Pass the MySQL pool to routes
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Handle render route
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '/src/index.html');
    fs.access(indexPath, fs.constants.F_OK, (err) => {
        if (err) {
            res.send('Welcome to Courtify'); // If index.html doesn't exist
        } else {
            res.sendFile(indexPath); // If index.html exists, send it
        }
    });
});

// Use user routes
app.use('/api', userRoutes); // Assuming user routes start with '/api'

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
