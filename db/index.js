const { Pool } = require('pg');

const pool = new Pool({
  // eslint-disable-next-line no-undef
  host: process.env.DB_HOST,
  // eslint-disable-next-line no-undef
  port: process.env.DB_PORT,
  // eslint-disable-next-line no-undef
  database: process.env.DB_NAME,
  // eslint-disable-next-line no-undef
  user: process.env.DB_USER,
  // eslint-disable-next-line no-undef
  password: process.env.DB_PASSWORD,
});

pool.connect((err, _, release) => {
  if (err) {
    console.error('Could not connect to the database', err);
  } else {
    console.log('Successfully connected to the database');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool: pool,
};
