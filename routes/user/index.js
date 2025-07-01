const express = require('express');
const router = express.Router();

// Import individual route files
const user_routes = require('./login');

// Mount routes with their base paths
router.use('/user', user_routes);

module.exports = router;
