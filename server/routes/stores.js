const express = require('express');
const { body, validationResult, query } = require('express-validator');
const router = express.Router();

const Store = require('../models/Store');
const User = require('../models/User');
const { protect, authorize, checkPermission, checkStoreAccess } = require('../middleware/auth');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Private
router.get('/', [
  protect,
  query('status').optional().isIn(['active', 'inactive', 'maintenance', 'closed']),
  query('type').optional().isIn(['supermarket', 'convenience_store', 'hypermarket', 'wholesale']),
  query('city').optional().trim(),
  query('state').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['name', 'code', 'createdAt', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      status,
      type,
      city,
      state,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (state) query['address.state'] = { $regex: state, $options: 'i' };

    // If user is not super_admin, only show stores they have access to
    if (req.user.role !== 'super_admin') {
      query._id = req.user.storeId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query
    const stores = await Store.find(query)
      .populate('manager', 'firstName lastName email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Store.countDocuments(query);

    res.json({
      success: true,
      data: stores,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Private
router.get('/:id', [
  protect,
  checkStoreAccess('id')
], async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('manager', 'firstName lastName email phone')
      .populate('staff.userId', 'firstName lastName email phone role');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Create new store
// @route   POST /api/stores
// @access  Private (super_admin, admin)
router.post('/', [
  protect,
  authorize('super_admin', 'admin'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Store name is required and must be less than 100 characters'),
  body('code')
    .trim()
    .isLength({ min: 3, max: 10 })
    .matches(/^[A-Z0-9]{3,10}$/)
    .withMessage('Store code must be 3-10 characters, uppercase letters and numbers only'),
  body('type')
    .isIn(['supermarket', 'convenience_store', 'hypermarket', 'wholesale'])
    .withMessage('Invalid store type'),
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
    .withMessage('State/Region is required'),
  body('contact.phone')
    .matches(/^(\+95|95|0)?[0-9]{9,10}$/)
    .withMessage('Please provide a valid Myanmar phone number'),
  body('contact.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('manager')
    .isMongoId()
    .withMessage('Valid manager ID is required'),
  body('businessHours.*.open')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Open time must be in HH:MM format'),
  body('businessHours.*.close')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Close time must be in HH:MM format')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name,
      code,
      type,
      address,
      contact,
      manager,
      businessHours,
      settings,
      features,
      notes
    } = req.body;

    // Check if store code already exists
    const existingStore = await Store.findOne({ code });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: 'Store code already exists'
      });
    }

    // Check if manager exists and has appropriate role
    const managerUser = await User.findById(manager);
    if (!managerUser) {
      return res.status(400).json({
        success: false,
        message: 'Manager not found'
      });
    }

    if (!['store_manager', 'admin'].includes(managerUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'Manager must have store_manager or admin role'
      });
    }

    // Create store
    const store = await Store.create({
      name,
      code,
      type,
      address,
      contact,
      manager,
      businessHours: businessHours || {},
      settings: settings || {},
      features: features || {},
      notes,
      createdBy: req.user._id
    });

    // Update manager's storeId
    await User.findByIdAndUpdate(manager, { storeId: store._id });

    // Populate manager info
    await store.populate('manager', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: store
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private (super_admin, admin, store_manager of the store)
router.put('/:id', [
  protect,
  checkStoreAccess('id'),
  authorize('super_admin', 'admin', 'store_manager'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Store name must be less than 100 characters'),
  body('type')
    .optional()
    .isIn(['supermarket', 'convenience_store', 'hypermarket', 'wholesale'])
    .withMessage('Invalid store type'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance', 'closed'])
    .withMessage('Invalid status'),
  body('address.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address cannot be empty'),
  body('address.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),
  body('address.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State/Region cannot be empty'),
  body('contact.phone')
    .optional()
    .matches(/^(\+95|95|0)?[0-9]{9,10}$/)
    .withMessage('Please provide a valid Myanmar phone number'),
  body('contact.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('manager')
    .optional()
    .isMongoId()
    .withMessage('Valid manager ID is required'),
  body('businessHours.*.open')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Open time must be in HH:MM format'),
  body('businessHours.*.close')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Close time must be in HH:MM format')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const storeId = req.params.id;
    const updateData = req.body;

    // If changing manager, validate the new manager
    if (updateData.manager) {
      const newManager = await User.findById(updateData.manager);
      if (!newManager) {
        return res.status(400).json({
          success: false,
          message: 'New manager not found'
        });
      }

      if (!['store_manager', 'admin'].includes(newManager.role)) {
        return res.status(400).json({
          success: false,
          message: 'New manager must have store_manager or admin role'
        });
      }

      // Update new manager's storeId
      await User.findByIdAndUpdate(updateData.manager, { storeId });
    }

    // Update store
    const store = await Store.findByIdAndUpdate(
      storeId,
      updateData,
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName email phone');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.json({
      success: true,
      message: 'Store updated successfully',
      data: store
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private (super_admin only)
router.delete('/:id', [
  protect,
  authorize('super_admin')
], async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Soft delete - set isActive to false
    store.isActive = false;
    store.status = 'closed';
    await store.save();

    res.json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get store statistics
// @route   GET /api/stores/:id/stats
// @access  Private
router.get('/:id/stats', [
  protect,
  checkStoreAccess('id')
], async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Get performance summary
    const stats = store.getPerformanceSummary();

    res.json({
      success: true,
      data: {
        store: {
          id: store._id,
          name: store.name,
          code: store.code,
          status: store.status,
          isOpen: store.isOpen()
        },
        stats
      }
    });
  } catch (error) {
    console.error('Get store stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get store dashboard data
// @route   GET /api/stores/:id/dashboard
// @access  Private
router.get('/:id/dashboard', [
  protect,
  checkStoreAccess('id')
], async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // This would typically include more complex data aggregation
    // For now, returning basic store info
    const dashboardData = {
      store: {
        id: store._id,
        name: store.name,
        code: store.code,
        status: store.status,
        isOpen: store.isOpen(),
        businessHours: store.businessHoursDisplay
      },
      performance: store.getPerformanceSummary(),
      // Additional dashboard data would go here
      // - Recent sales
      // - Low stock alerts
      // - Staff on duty
      // - Today's schedule
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get store dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;