const express = require('express');
const {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  assignEmployee,
  removeEmployee
} = require('../controllers/storeController');

const { protect, authorize } = require('../middleware/auth');
const { validateStore, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getStores)
  .post(authorize('owner'), validateStore, createStore);

router.route('/:id')
  .get(validateObjectId('id'), getStore)
  .put(authorize('owner'), validateObjectId('id'), updateStore)
  .delete(authorize('owner'), validateObjectId('id'), deleteStore);

router.put('/:id/assign-employee', 
  authorize('owner'), 
  validateObjectId('id'), 
  assignEmployee
);

router.put('/:id/remove-employee', 
  authorize('owner'), 
  validateObjectId('id'), 
  removeEmployee
);

module.exports = router;