const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

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
app.use(morgan("combined")); // Logging
app.use(express.json()); // Parse JSON bodies

pool.connect((err, _, release) => {
  if (err) {
    console.error("Could not connect to the database", err);
  } else {
    console.log("Successfully connected to the database");
    release();
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM "user"`);

    res.json({
      message: "Users retrieved successfully",
      users: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Database error", error);
    res.status(500).json({
      error: "Failed to retrieve users",
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
