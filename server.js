const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
// eslint-disable-next-line no-undef
const port = process.env.PORT || 3000;

app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies

const routes = require('./routes');
app.use('/api', routes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
