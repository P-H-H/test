const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password').populate('assignedStore');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this resource`
      });
    }

    next();
  };
};

// Store access authorization (employees can only access their assigned store)
const authorizeStore = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.store || req.query.store;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required'
      });
    }

    // Owners can access all stores
    if (req.user.role === 'owner') {
      return next();
    }

    // Employees can only access their assigned store
    if (req.user.role === 'employee') {
      if (!req.user.assignedStore || req.user.assignedStore._id.toString() !== storeId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this store'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Store authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during store authorization'
    });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = {
  protect,
  authorize,
  authorizeStore,
  generateToken
};