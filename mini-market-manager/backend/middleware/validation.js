const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .isIn(['owner', 'employee'])
    .withMessage('Role must be either owner or employee'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Store validation rules
const validateStore = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ max: 100 })
    .withMessage('Store name cannot exceed 100 characters'),
  
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Store code is required')
    .isLength({ max: 10 })
    .withMessage('Store code cannot exceed 10 characters'),
  
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  
  handleValidationErrors
];

// Product validation rules
const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),
  
  body('barcode')
    .trim()
    .notEmpty()
    .withMessage('Barcode is required'),
  
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Food & Beverages',
      'Personal Care',
      'Household Items',
      'Snacks & Confectionery',
      'Health & Medicine',
      'Stationery',
      'Electronics',
      'Clothing',
      'Other'
    ])
    .withMessage('Invalid category'),
  
  body('pricing.costPrice')
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  
  body('pricing.sellingPrice')
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a positive number'),
  
  body('supplier.name')
    .trim()
    .notEmpty()
    .withMessage('Supplier name is required'),
  
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(['piece', 'kg', 'gram', 'liter', 'ml', 'pack', 'box', 'bottle', 'can'])
    .withMessage('Invalid unit'),
  
  handleValidationErrors
];

// Sale validation rules
const validateSale = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'card', 'digital_wallet', 'bank_transfer', 'other'])
    .withMessage('Invalid payment method'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  validateUser,
  validateLogin,
  validateStore,
  validateProduct,
  validateSale,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};