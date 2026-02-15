const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const [existingUsers] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    return next(new AppError('Email already registered', 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Start transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Insert user
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    // Create default wallet for user
    await connection.query(
      'INSERT INTO wallets (user_id, current_balance, created_at) VALUES (?, 0, NOW())',
      [userId]
    );

    // Commit transaction
    await connection.commit();
    connection.release();

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: userId,
          name,
          email
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const [users] = await db.query(
    'SELECT id, name, email, password FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    return next(new AppError('Invalid email or password', 401));
  }

  const user = users[0];

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Generate token
  const token = generateToken(user.id);

  res.status(200).json({
    status: 'success',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const [users] = await db.query(
    'SELECT id, name, email, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  if (users.length === 0) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: users[0]
    }
  });
});

// @desc    Verify token
// @route   POST /api/auth/verify
// @access  Public
exports.verifyToken = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Token is required', 400));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await db.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return next(new AppError('Invalid token', 401));
    }

    res.status(200).json({
      status: 'success',
      data: {
        valid: true,
        user: users[0]
      }
    });
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
});
