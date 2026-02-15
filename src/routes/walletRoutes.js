const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const walletController = require('../controllers/walletController');

router.use(protect);

router.post('/transaction', walletController.addWalletTransaction);

module.exports = router;