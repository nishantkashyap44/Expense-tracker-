const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const db = require('../config/database');

const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again.', 401));
      }
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your token has expired. Please log in again.', 401));
      }
      return next(new AppError('Token verification failed.', 401));
    }

    // Check if user still exists
    const [users] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);
    
    if (users.length === 0) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Grant access to protected route
    req.user = {
      id: users[0].id,
      name: users[0].name,
      email: users[0].email
    };

    next();
  } catch (error) {
    next(new AppError('Authentication failed.', 401));
  }
};

module.exports = { protect };
