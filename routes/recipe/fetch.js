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
  SELECT 
    r.recipe_id, r.recipe_name, r.cook_time,
    i.ingredient_name, i.quantity, i.unit,
    inst.step_number, inst.instruction_text
  FROM recipe r
  LEFT JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
  LEFT JOIN ingredient i ON ri.ingredient_id = i.ingredient_id
  LEFT JOIN instruction inst ON r.recipe_id = inst.recipe_id
  WHERE r.user_id = $1
  ORDER BY r.recipe_id, ri.ingredient_name, inst.step_number;
  `;

  try {
    const result = await db.query(query, [req.params.id]);

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
