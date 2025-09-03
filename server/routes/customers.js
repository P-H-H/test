const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { protect, authorize, checkPermission, checkStoreAccess } = require('../middleware/auth');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Validation middleware
const validateCustomer = [
  body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('nameMyanmar').optional().isString().trim().isLength({ max: 100 }).withMessage('Myanmar name cannot exceed 100 characters'),
  body('phone').matches(/^(\+95|95|0)?[0-9]{9,10}$/).withMessage('Please provide a valid Myanmar phone number'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('address.street').optional().isString().trim().isLength({ max: 200 }).withMessage('Street address cannot exceed 200 characters'),
  body('address.city').optional().isString().trim().isLength({ max: 100 }).withMessage('City cannot exceed 100 characters'),
  body('address.state').optional().isString().trim().isLength({ max: 100 }).withMessage('State cannot exceed 100 characters'),
  body('preferences.language').optional().isIn(['en', 'my']).withMessage('Language must be en or my'),
  body('preferences.currency').optional().isIn(['MMK', 'USD']).withMessage('Currency must be MMK or USD'),
  body('loyalty.cardNumber').optional().isString().trim().isLength({ max: 50 }).withMessage('Loyalty card number cannot exceed 50 characters')
];

const validateCustomerUpdate = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().matches(/^(\+95|95|0)?[0-9]{9,10}$/).withMessage('Please provide a valid Myanmar phone number'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('status').optional().isIn(['active', 'inactive', 'suspended', 'deceased']).withMessage('Valid status is required')
];

// Get all customers with filtering and pagination
router.get('/', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('status').optional().isIn(['active', 'inactive', 'suspended', 'deceased']).withMessage('Valid status is required'),
  query('loyaltyTier').optional().isIn(['bronze', 'silver', 'gold', 'platinum', 'diamond']).withMessage('Valid loyalty tier is required'),
  query('search').optional().isString().trim().isLength({ min: 2 }).withMessage('Search term must be at least 2 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['name', 'createdAt', 'loyalty.points', 'purchaseHistory.totalSpent']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      storeId,
      status,
      loyaltyTier,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      // Filter customers by store preferences
      query['storePreferences.primaryStore'] = storeId;
    } else if (!checkPermission(req.user, 'view_all_customers')) {
      // If no store specified and user can't view all customers, restrict to their store
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query['storePreferences.primaryStore'] = userStoreId;
      }
    }

    if (status) query.status = status;
    if (loyaltyTier) query['loyalty.tier'] = loyaltyTier;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameMyanmar: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'loyalty.cardNumber': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const customers = await Customer.find(query)
      .populate('storePreferences.primaryStore', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single customer by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Valid customer ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const customer = await Customer.findById(req.params.id)
      .populate('storePreferences.primaryStore', 'name code address')
      .populate('purchaseHistory.favoriteProducts.productId', 'name sku category images');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check store access if customer has a primary store
    if (customer.storePreferences.primaryStore && 
        !checkStoreAccess(req.user, customer.storePreferences.primaryStore._id)) {
      return res.status(403).json({ message: 'Access denied to this customer' });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new customer
router.post('/', [
  ...validateCustomer
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      nameMyanmar,
      phone,
      email,
      address,
      personalInfo,
      preferences,
      loyalty,
      storePreferences,
      notes
    } = req.body;

    // Check if phone number already exists
    const existingCustomer = await Customer.findOne({ phone, isActive: true });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this phone number already exists' });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Customer.findOne({ email, isActive: true });
      if (existingEmail) {
        return res.status(400).json({ message: 'Customer with this email already exists' });
      }
    }

    // Check store access if primary store is specified
    if (storePreferences?.primaryStore) {
      if (!checkStoreAccess(req.user, storePreferences.primaryStore)) {
        return res.status(403).json({ message: 'Access denied to specified store' });
      }
    }

    // Create customer
    const customer = new Customer({
      name,
      nameMyanmar,
      phone,
      email,
      address,
      personalInfo,
      preferences: {
        language: preferences?.language || 'en',
        currency: preferences?.currency || 'MMK',
        communication: preferences?.communication || { sms: true, email: true, push: false },
        marketing: preferences?.marketing !== false
      },
      loyalty: {
        cardNumber: loyalty?.cardNumber,
        points: loyalty?.points || 0,
        tier: loyalty?.tier || 'bronze'
      },
      storePreferences,
      notes,
      createdBy: req.user._id
    });

    await customer.save();

    // Populate references for response
    await customer.populate('storePreferences.primaryStore', 'name code');

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', [
  param('id').isMongoId().withMessage('Valid customer ID is required'),
  ...validateCustomerUpdate
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check store access if customer has a primary store
    if (customer.storePreferences.primaryStore && 
        !checkStoreAccess(req.user, customer.storePreferences.primaryStore)) {
      return res.status(403).json({ message: 'Access denied to this customer' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_customers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'nameMyanmar', 'phone', 'email', 'address', 'personalInfo',
      'preferences', 'loyalty', 'storePreferences', 'notes', 'status', 'tags'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        customer[field] = req.body[field];
      }
    });

    customer.updatedBy = req.user._id;
    await customer.save();

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete customer (soft delete)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Valid customer ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check store access if customer has a primary store
    if (customer.storePreferences.primaryStore && 
        !checkStoreAccess(req.user, customer.storePreferences.primaryStore)) {
      return res.status(403).json({ message: 'Access denied to this customer' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_customers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Soft delete
    customer.isActive = false;
    customer.status = 'inactive';
    customer.updatedBy = req.user._id;
    await customer.save();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add loyalty points
router.post('/:id/loyalty/points', [
  param('id').isMongoId().withMessage('Valid customer ID is required'),
  body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer'),
  body('reason').isString().trim().notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { points, reason } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check store access if customer has a primary store
    if (customer.storePreferences.primaryStore && 
        !checkStoreAccess(req.user, customer.storePreferences.primaryStore)) {
      return res.status(403).json({ message: 'Access denied to this customer' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_customers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Add points
    await customer.addPoints(points, reason);

    res.json({
      success: true,
      message: 'Loyalty points added successfully',
      data: {
        currentPoints: customer.loyalty.points,
        tier: customer.loyalty.tier,
        tierDisplay: customer.tierDisplay
      }
    });
  } catch (error) {
    console.error('Error adding loyalty points:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer purchase history
router.get('/:id/purchases', [
  param('id').isMongoId().withMessage('Valid customer ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 20, startDate, endDate } = req.query;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check store access if customer has a primary store
    if (customer.storePreferences.primaryStore && 
        !checkStoreAccess(req.user, customer.storePreferences.primaryStore)) {
      return res.status(403).json({ message: 'Access denied to this customer' });
    }

    // Build query
    const query = { customerId: customer._id, isActive: true, status: 'completed' };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const purchases = await Sale.find(query)
      .populate('storeId', 'name code')
      .populate('staffId', 'personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      data: purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customer purchases:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer statistics
router.get('/:id/stats', [
  param('id').isMongoId().withMessage('Valid customer ID is required'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate } = req.query;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check store access if customer has a primary store
    if (customer.storePreferences.primaryStore && 
        !checkStoreAccess(req.user, customer.storePreferences.primaryStore)) {
      return res.status(403).json({ message: 'Access denied to this customer' });
    }

    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 365));
    const end = endDate ? new Date(endDate) : new Date();

    // Get purchase statistics for the period
    const query = {
      customerId: customer._id,
      createdAt: { $gte: start, $lte: end },
      isActive: true,
      status: 'completed'
    };

    const stats = await Sale.getSalesStats(null, start, end);

    res.json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          loyaltyTier: customer.loyalty.tier,
          totalPoints: customer.loyalty.points,
          joinDate: customer.loyalty.joinDate
        },
        period: { start, end },
        purchases: {
          total: stats.totalTransactions,
          totalSpent: stats.totalSales,
          averageOrderValue: stats.averageTransactionValue,
          totalItems: stats.totalItems
        },
        loyalty: {
          currentTier: customer.loyalty.tier,
          pointsEarned: customer.loyalty.lifetimePoints,
          nextTier: customer.loyalty.tier === 'bronze' ? 'silver' : 
                    customer.loyalty.tier === 'silver' ? 'gold' :
                    customer.loyalty.tier === 'gold' ? 'platinum' :
                    customer.loyalty.tier === 'platinum' ? 'diamond' : null,
          pointsToNextTier: customer.loyalty.tier === 'bronze' ? 500 - customer.loyalty.points :
                           customer.loyalty.tier === 'silver' ? 2000 - customer.loyalty.points :
                           customer.loyalty.tier === 'gold' ? 5000 - customer.loyalty.points :
                           customer.loyalty.tier === 'platinum' ? 10000 - customer.loyalty.points : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer statistics overview
router.get('/stats/overview', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query['storePreferences.primaryStore'] = storeId;
    } else if (!checkPermission(req.user, 'view_all_customers')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query['storePreferences.primaryStore'] = userStoreId;
      }
    }

    // Get customer statistics
    const stats = await Customer.getCustomerStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customers by loyalty tier
router.get('/stats/by-tier', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query['storePreferences.primaryStore'] = storeId;
    } else if (!checkPermission(req.user, 'view_all_customers')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query['storePreferences.primaryStore'] = userStoreId;
      }
    }

    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: '$loyalty.tier',
          count: { $sum: 1 },
          totalPoints: { $sum: '$loyalty.points' },
          averageSpending: { $avg: '$purchaseHistory.totalSpent' }
        }
      },
      { $sort: { count: -1 } }
    ];

    const results = await Customer.aggregate(pipeline);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching customers by tier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;