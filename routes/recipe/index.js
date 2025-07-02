const express = require('express');
const router = express.Router();

// Import individual route files
const recipe_create = require('./create');
const recipe_fetch = require('./fetch');
const recipe_update = require('./update');
const recipe_delete = require('./delete');
const recipe_filter = require('./filter');

// Mount routes with their base paths
router.use('/create', recipe_create);
router.use('/fetch', recipe_fetch);
router.use('/update', recipe_update);
router.use('/delete', recipe_delete);
router.use('/filter', recipe_filter);

module.exports = router;
