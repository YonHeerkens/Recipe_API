const express = require('express');
const router = express.Router();
const db = require('../../db');

/**
 * @route POST /api/recipe/create
 * @description Adds a new recipe to the database
 * @param {recipe} recipe object that contains:
 *   name
 *   user - to whom the recipe belongs
 *   cooktime
 *   oventime - May be null if not applicable
 *   servings - The amount of portions that the recipe will give
 *   difficulty_level - How hard the recipe is perceived *
 */
router.post('/', async (req, res) => {
  res.json({ message: 'This is the post endpoint for recipes' });
  try {
    // const user_input = req.body;
    // const result = db.query('');
  } catch (error) {
    console.error('Error creating a new recipe', {
      error: error.message,
      code: error.code,
      detail: error.etail,
      timestamp: new Date().toISOString(),
      body: req.body,
    });

    if (error === '23505') {
      return res.status(409).json({
        error: 'Recipe already exists',
      });
    }

    res.status(500).json({
      error: 'Failed to create new recipe',
    });
  }
});

module.exports = router;
