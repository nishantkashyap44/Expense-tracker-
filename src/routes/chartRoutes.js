const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

// Placeholder routes - implement based on your controller
router.get('/', (req, res) => res.json({ message: 'Get charts' }));

module.exports = router;
