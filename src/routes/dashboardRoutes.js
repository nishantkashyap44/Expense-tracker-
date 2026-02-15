const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getRecentTransactions,
  getMonthlyTrend,
  getBudgetComparison
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { dateQueryValidation } = require('../middleware/validation');

// All dashboard routes require authentication
router.use(protect);

router.get('/summary', dateQueryValidation, getDashboardSummary);
router.get('/recent-transactions', getRecentTransactions);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/budget-comparison', dateQueryValidation, getBudgetComparison);

module.exports = router;
