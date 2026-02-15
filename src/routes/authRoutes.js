const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  verifyToken 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { 
  registerValidation, 
  loginValidation 
} = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/verify', verifyToken);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
