const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const budgetController = require('../controllers/budgetController');

router.use(protect);

router.get('/', budgetController.getBudgets);
router.post('/', budgetController.createBudget);

module.exports = router;