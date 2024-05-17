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

async function getCourtInfo() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM court_tb WHERE availability = 1');
    return rows;
  } catch (error) {
    console.error('Error retrieving court information:', error);
    throw error;
  } finally {
    connection.release();
  }
}

router.get('/:user_id', async (req, res) => {
  const userId = req.params.user_id;

  try {
    const [rows] = await pool.query('SELECT * FROM court_tb WHERE user_id = ? AND availability = 1', [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving court information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/availability/:court_id', async (req, res) => {
  const courtId = req.params.court_id;

  try {
    const [rows] = await pool.query('SELECT * FROM court_availability_tb WHERE court_id = ?', [courtId]);
    if (!rows || rows.length === 0) {
      console.log('No court availability data found for court ID:', courtId);
      return res.status(404).json({ message: 'No court availability data found' });
    }
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving court availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/court/:court_id', async (req, res) => {
  const courtId = req.params.court_id;

  try {
    const [rows] = await pool.query('SELECT * FROM court_tb WHERE court_id = ?', [courtId]);
    if (!rows || rows.length === 0) {
      console.log('No court found with ID:', courtId);
      return res.status(404).json({ message: 'Court not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error retrieving court information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const courtInfo = await getCourtInfo();
    res.json(courtInfo);
  } catch (error) {
    console.error('Error retrieving court information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
