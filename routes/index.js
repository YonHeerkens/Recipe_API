const express = require('express');
const router = express.Router();

// Import individual route files
const recipe_routes = require('./recipe');
const user_routes = require('./user');

// Mount routes with their base paths
router.use('/recipe', recipe_routes);
router.use('/user', user_routes);

module.exports = router;
