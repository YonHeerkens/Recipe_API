const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');

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

router.post('/', async (req, res) => {
  try {
    const user_input = req.body;

    const validation_result = validateUserInput(user_input);

    if (!validation_result.isValid) {
      return res.status(400).json({
        error: validation_result.total_errors[0],
      });
    }

    const clean_data = cleanInput(user_input);

    const new_user = await createUser(clean_data);

    res.status(201).json({
      message: 'User created successfully',
      user: new_user,
    });
  } catch (error) {
    // Detailed error message for debugging
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

async function createUser(clean_data) {
  // Prevent sql injections by using placeholders
  const query = `
    INSERT INTO users (first_name, last_name, email) 
    VALUES($1,$2,$3) 
    RETURNING *
    `;

  const { clean_first_name, clean_last_name, clean_email } = clean_data;
  const result = await db.query(query, [
    clean_first_name,
    clean_last_name,
    clean_email,
  ]);
  return result.rows[0];
}

const cleanInput = (user_input) => {
  const { first_name, last_name, email } = user_input;
  return {
    // Cleaning input
    clean_first_name: first_name.trim(),
    clean_last_name: last_name.trim(),
    clean_email: email.trim().toLowerCase(),
  };
};

const validateUserInput = (user_input) => {
  const { first_name, last_name, email } = user_input;
  const errors = [];

  // Input validation
  // Cant have empty values when making a new user
  if (!first_name || !last_name || !email) {
    errors.push('First name, last name, and email are required');
    return {
      isValid: false,
      errors,
    };
  }

  const is_suspicious = isUserInputSuspicious(user_input);
  const length_check = validateUserInputLength(user_input);
  const total_errors = [...errors, ...is_suspicious, ...length_check];

  return {
    isValid: total_errors.length === 0,
    total_errors,
  };
};

const isUserInputSuspicious = (user_input) => {
  const { first_name, last_name, email } = user_input;
  const errors = [];

  if (isSuspiciousString(first_name)) {
    errors.push('Please provide a valid first name');
  }

  if (isSuspiciousString(last_name)) {
    errors.push('Please provide a valid last name');
  }

  if (isSuspiciousString(email) || !isValidEmail(email)) {
    errors.push('Please provide a valid email');
  }

  return errors;
};

const validateUserInputLength = (user_input) => {
  const { first_name, last_name, email } = user_input;
  const errors = [];
  // Length validation
  if (first_name.length > 50) {
    errors.push('First name must be 50 characters or less');
  }

  if (last_name.length > 50) {
    errors.push('Last name must be 50 characters or less');
  }

  if (email.length > 254) {
    errors.push('Email must be 254 characters or less');
  }

  return errors;
};

const isValidEmail = (email) => {
  // Email validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Additional checks
  if (!emailRegex.test(email)) return false;
  if (email.length > 254) return false; // RFC 5321 limit
  if (email.split('@')[0].length > 64) return false; // Local part limit

  return true;
};

const isSuspiciousString = (string) => {
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

module.exports = router;
