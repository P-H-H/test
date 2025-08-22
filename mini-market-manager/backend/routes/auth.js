const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');
const { validateUser, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logout);

// Owner only routes
router.post('/create-employee', authorize('owner'), validateUser, register);

module.exports = router;