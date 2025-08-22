const express = require('express');
const {
  createSale,
  getSales,
  getSale,
  refundSale,
  getSalesAnalytics
} = require('../controllers/salesController');

const { protect, authorize } = require('../middleware/auth');
const { validateSale, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Special routes
router.get('/analytics', getSalesAnalytics);

router.route('/')
  .get(validatePagination, getSales)
  .post(validateSale, createSale);

router.route('/:id')
  .get(validateObjectId('id'), getSale);

router.put('/:id/refund', validateObjectId('id'), refundSale);

module.exports = router;