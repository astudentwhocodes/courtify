require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path'); 

const userRoutes = require('./src/config/user.js');
const userInfoRoutes = require('./src/config/user_info.js');
const courtInfoRoutes = require('./src/config/court_info.js');
const courtRoutes = require('./src/config/court.js');
const dashboardInfoRoutes = require('./src/config/dashboard_info.js');
const bookCourtRoutes = require('./src/config/book.js');
const imageRoutes = require('./src/config/image.js');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'src')));

const pool = mysql.createPool({
    connectionLimit: 20,
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12707087',
    password: 'tDTTLUjj5Y',
    database: 'sql12707087',
    port: 3306 // Port number
});

app.use((req, res, next) => {
    req.pool = pool;
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

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
