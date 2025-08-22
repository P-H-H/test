const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ message: 'Not authorized, user not found or inactive' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin/Owner only
const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Owner role required.' });
  }
};

// Owner or Manager
const ownerOrManager = async (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else if (req.user && req.user.role === 'employee') {
    // Check if employee is a manager of any store
    const Store = require('../models/Store');
    const managedStores = await Store.find({ manager: req.user._id });
    if (managedStores.length > 0) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Manager role required.' });
    }
  } else {
    res.status(403).json({ message: 'Access denied.' });
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = {
  protect,
  ownerOnly,
  ownerOrManager,
  generateToken
};