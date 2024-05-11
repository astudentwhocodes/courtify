const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path'); 

// Import user routes
const userRoutes = require('config/user.js');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, 'src')));

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

// Serve index.html on GET request to /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Use user routes
app.use('/api', userRoutes); // Assuming user routes start with '/api'

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
