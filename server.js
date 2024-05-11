const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path'); 

// Import user routes
const userRoutes = require('./src/config/user.js');
const userInfoRoutes = require('./src/config/user_info.js');
const courtInfoRoutes = require('./src/config/court_info.js');
const courtRoutes = require('./src/config/court.js');
const dashboardInfoRoutes = require('./src/config/dashboard_info.js');
const bookCourtRoutes = require('./src/config/book.js');
const imageRoutes = require('./src/config/image.js'); // Import image routes

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
app.use('/userinfo', userInfoRoutes); // Assuming user routes start with '/api'
app.use('/courtinfo', courtInfoRoutes); // Assuming user routes start with '/api'
app.use('/book', bookCourtRoutes);
app.use('/dashboardinfo', dashboardInfoRoutes);
app.use('/image', imageRoutes);
app.use('/court', courtRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
