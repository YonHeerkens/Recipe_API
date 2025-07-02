const express = require('express');
const router = express.Router();
const db = require('../../db');

// add a user_id requirement as filter later
/**
 * @route GET /api/recipe/fetch:user_id
 * @description Gets all the recipes belonging to a certain user
 * @param {id} -user_id, decides which recipes to show for a user
 * @return {recipe_id, user_id, recipe_name, cook_time, oven_time, servings, difficulty_level}
 */
router.get('/:id', async (req, res) => {
  const query = `
  SELECT * FROM recipe WHERE user_id = $1`;

  try {
    const result = await db.query(query, req.id);

    res.json({
      message: 'Recipes Successfully retrieved',
      recipes: result.rows,
    });
  } catch (error) {
    console.error('Database error', error);
    res.status(500).json({
      error: 'Failed to retrieve recipes',
      body: req.body,
    });
  }
});

module.exports = router;
