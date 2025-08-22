const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getProductByBarcode,
  getLowStockProducts
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');
const { validateProduct, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Special routes (must come before :id routes)
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/alerts/low-stock', getLowStockProducts);

router.route('/')
  .get(validatePagination, getProducts)
  .post(validateProduct, createProduct);

router.route('/:id')
  .get(validateObjectId('id'), getProduct)
  .put(validateObjectId('id'), updateProduct)
  .delete(authorize('owner'), validateObjectId('id'), deleteProduct);

router.put('/:id/inventory', validateObjectId('id'), updateInventory);

module.exports = router;