const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'This it the get endpoint' });
});

router.post('/', (req, res) => {
  res.json({ message: 'This is the post endpoint for recipes' });
});

module.exports = router;
