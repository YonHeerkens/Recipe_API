const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies

pool.connect((err, _, release) => {
  if (err) {
    console.error('Could not connect to the database', err);
  } else {
    console.log('Successfully connected to the database');
    release();
  }
});

app.get('/api/user', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');

    res.json({
      message: 'Users retrieved successfully',
      users: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Database error', error);
    res.status(500).json({
      error: 'Failed to retrieve users',
    });
  }
});

app.post('/api/user', create_userLimit, async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;

    // Input validation
    // Cant have empty values when making a new user
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        error: 'First name, last name, and email are required',
      });
    }

    if (is_suspicious_string(first_name)) {
      return res.status(400).json({
        error: 'Please provide a valid first name',
      });
    }

    if (is_suspicious_string(last_name)) {
      return res.status(400).json({
        error: 'Please provide a valid last name',
      });
    }

    if (is_suspicious_string(email) || !is_valid_email(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email',
      });
    }

    // Length validation
    if (first_name.length > 50) {
      return res.status(400).json({
        error: 'First name must be 50 characters or less',
      });
    }

    if (last_name.length > 50) {
      return res.status(400).json({
        error: 'Last name must be 50 characters or less',
      });
    }

    if (email.length > 254) {
      return res.status(400).json({
        error: 'Email must be 254 characters or less',
      });
    }
    // ----------- end validation

    // Cleaning input
    const clean_first_name = first_name.trim();
    const clean_last_name = last_name.trim();
    const clean_email = email.trim().toLowerCase();

    // Prevent sql injections by using placeholders
    const query = `
    INSERT INTO users (first_name, last_name, email) 
    VALUES($1,$2,$3) 
    RETURNING *
    `;

    const result = await pool.query(query, [
      clean_first_name,
      clean_last_name,
      clean_email,
    ]);
    const new_user = result.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: new_user,
    });
  } catch (error) {
    console.error('Error creating new user', {
      error: error.message,
      code: error.code,
      detail: error.detail,
      timestamp: new Date().toISOString(),
      body: req.body,
    });

    if (error.code === '23505') {
      // Postgres Unique restrained was violated
      return res.status(409).json({
        error: 'Email already exists',
      });
    }
    res.status(500).json({
      error: 'Failed to create new user',
    });
  }
});

const is_valid_email = (email) => {
  // Email validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Additional checks
  if (!emailRegex.test(email)) return false;
  if (email.length > 254) return false; // RFC 5321 limit
  if (email.split('@')[0].length > 64) return false; // Local part limit

  return true;
};

// Used to prevent spam attacks by creating a bot that creates users
const create_userLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many user creation attempts, please try again later',
});

const is_suspicious_string = (string) => {
  if (typeof string !== 'string' || string.trim().length === 0) {
    return true;
  }

  // Suspicious patterns for SQL
  const suspiciousPatterns = [
    /script/i, // Case-insensitive script detection
    /drop\s+table/i, // DROP TABLE with possible spaces
    /delete\s+from/i, // DELETE FROM statements
    /insert\s+into/i, // INSERT INTO statements
    /update\s+set/i, // UPDATE SET statements
    /union\s+select/i, // SQL injection technique
    /<[^>]*>/, // HTML tags (basic XSS protection)
    /javascript:/i, // JavaScript protocol
    /data:/i, // Data URLs
    /vbscript:/i, // VBScript protocol
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(string));
};

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
