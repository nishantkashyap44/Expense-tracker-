const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

router.use(protect);

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);
router.delete('/:id', transactionController.deleteTransaction); // ✅ Add this

module.exports = router;