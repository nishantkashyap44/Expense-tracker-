const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');

// Protect all routes
router.use(protect);

// GET all expenses
router.get('/', expenseController.getExpenses);

// CREATE expense
router.post('/', expenseController.createExpense);

module.exports = router;