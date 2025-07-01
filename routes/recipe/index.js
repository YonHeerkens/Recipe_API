const express = require('express');
const router = express.Router();

// Import individual route files
const recipe_routes = require('./crud');

// Mount routes with their base paths
router.use('/crud', recipe_routes);

module.exports = router;
