const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return next(new AppError(errorMessages.join(', '), 400));
  }
  next();
};

// Authentication validations
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

// Transaction validations
const transactionValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
    .toFloat(),
  
  body('type')
    .notEmpty().withMessage('Transaction type is required')
    .isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category must not exceed 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Description must not exceed 255 characters'),
  
  validate
];

// Expense validations
const expenseValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
    .toFloat(),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 50 }).withMessage('Category must not exceed 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Description must not exceed 255 characters'),
  
  body('month')
    .notEmpty().withMessage('Month is required')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12')
    .toInt(),
  
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100')
    .toInt(),
  
  validate
];

// Budget validations
const budgetValidation = [
  body('amount')
    .notEmpty().withMessage('Budget amount is required')
    .isFloat({ min: 0 }).withMessage('Budget amount must be zero or greater')
    .toFloat(),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 50 }).withMessage('Category must not exceed 50 characters'),
  
  body('month')
    .notEmpty().withMessage('Month is required')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12')
    .toInt(),
  
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100')
    .toInt(),
  
  validate
];

// ID parameter validation
const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID format')
    .toInt(),
  
  validate
];

// Date query validation
const dateQueryValidation = [
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12')
    .toInt(),
  
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100')
    .toInt(),
  
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  transactionValidation,
  expenseValidation,
  budgetValidation,
  idValidation,
  dateQueryValidation
};
