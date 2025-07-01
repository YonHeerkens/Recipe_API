const express = require('express');
const router = express.Router();

// Import individual route files
const recipe_routes = require('./recipes');

// Mount routes with their base paths
router.use('/create', recipe_routes);

module.exports = router;
