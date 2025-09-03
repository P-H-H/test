const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const Supplier = require('../models/Supplier');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Validation middleware
const validateSupplier = [
  body('name').isString().trim().isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('nameMyanmar').optional().isString().trim().isLength({ max: 200 }).withMessage('Myanmar name cannot exceed 200 characters'),
  body('type').isIn([
    'manufacturer', 'distributor', 'wholesaler', 'importer', 'local_producer',
    'farm', 'fishery', 'bakery', 'dairy', 'meat_processor', 'beverage_producer'
  ]).withMessage('Valid supplier type is required'),
  body('category').isIn([
    'fresh_produce', 'dairy_eggs', 'meat_seafood', 'bakery', 'frozen_foods',
    'pantry', 'beverages', 'snacks', 'household', 'personal_care',
    'baby_care', 'pet_supplies', 'electronics', 'clothing', 'pharmacy',
    'general', 'specialty'
  ]).withMessage('Valid supplier category is required'),
  body('contact.primary.name').optional().isString().trim().isLength({ max: 100 }).withMessage('Primary contact name cannot exceed 100 characters'),
  body('contact.primary.phone').optional().matches(/^(\+95|95|0)?[0-9]{9,10}$/).withMessage('Please provide a valid Myanmar phone number'),
  body('contact.primary.email').optional().isEmail().withMessage('Please provide a valid email'),
  body('contact.primary.position').optional().isString().trim().isLength({ max: 100 }).withMessage('Position cannot exceed 100 characters'),
  body('address.street').optional().isString().trim().isLength({ max: 200 }).withMessage('Street address cannot exceed 200 characters'),
  body('address.city').optional().isString().trim().isLength({ max: 100 }).withMessage('City cannot exceed 100 characters'),
  body('address.state').optional().isString().trim().isLength({ max: 100 }).withMessage('State cannot exceed 100 characters'),
  body('business.registrationNumber').optional().isString().trim().isLength({ max: 100 }).withMessage('Registration number cannot exceed 100 characters'),
  body('business.taxId').optional().isString().trim().isLength({ max: 100 }).withMessage('Tax ID cannot exceed 100 characters'),
  body('business.establishmentDate').optional().isISO8601().withMessage('Valid establishment date is required'),
  body('business.annualRevenue.amount').optional().isFloat({ min: 0 }).withMessage('Annual revenue amount must be positive'),
  body('business.annualRevenue.currency').optional().isIn(['MMK', 'USD']).withMessage('Currency must be MMK or USD'),
  body('business.employeeCount').optional().isIn(['1-10', '11-50', '51-200', '201-500', '500+']).withMessage('Valid employee count is required'),
  body('products.minimumOrderValue').optional().isFloat({ min: 0 }).withMessage('Minimum order value must be positive'),
  body('products.leadTime').optional().isInt({ min: 1, max: 365 }).withMessage('Lead time must be between 1 and 365 days'),
  body('products.paymentTerms').optional().isIn(['cash_on_delivery', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60']).withMessage('Valid payment terms are required'),
  body('products.creditLimit').optional().isFloat({ min: 0 }).withMessage('Credit limit must be positive')
];

const validateSupplierUpdate = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('contact.primary.phone').optional().matches(/^(\+95|95|0)?[0-9]{9,10}$/).withMessage('Please provide a valid Myanmar phone number'),
  body('contact.primary.email').optional().isEmail().withMessage('Please provide a valid email'),
  body('status').optional().isIn(['active', 'inactive', 'suspended', 'blacklisted', 'pending_approval']).withMessage('Valid status is required')
];

// Get all suppliers with filtering and pagination
router.get('/', [
  query('type').optional().isIn([
    'manufacturer', 'distributor', 'wholesaler', 'importer', 'local_producer',
    'farm', 'fishery', 'bakery', 'dairy', 'meat_processor', 'beverage_producer'
  ]).withMessage('Valid supplier type is required'),
  query('category').optional().isIn([
    'fresh_produce', 'dairy_eggs', 'meat_seafood', 'bakery', 'frozen_foods',
    'pantry', 'beverages', 'snacks', 'household', 'personal_care',
    'baby_care', 'pet_supplies', 'electronics', 'clothing', 'pharmacy',
    'general', 'specialty'
  ]).withMessage('Valid supplier category is required'),
  query('status').optional().isIn(['active', 'inactive', 'suspended', 'blacklisted', 'pending_approval']).withMessage('Valid status is required'),
  query('search').optional().isString().trim().isLength({ min: 2 }).withMessage('Search term must be at least 2 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['name', 'createdAt', 'performance.rating', 'financial.totalPurchases']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      category,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameMyanmar: { $regex: search, $options: 'i' } },
        { supplierCode: { $regex: search, $options: 'i' } },
        { 'contact.primary.name': { $regex: search, $options: 'i' } },
        { 'contact.primary.phone': { $regex: search, $options: 'i' } },
        { 'contact.primary.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const suppliers = await Supplier.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Supplier.countDocuments(query);

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single supplier by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Valid supplier ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new supplier
router.post('/', [
  ...validateSupplier
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      nameMyanmar,
      type,
      category,
      contact,
      address,
      business,
      products,
      notes
    } = req.body;

    // Check permissions
    if (!checkPermission(req.user, 'manage_suppliers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Create supplier
    const supplier = new Supplier({
      name,
      nameMyanmar,
      type,
      category,
      contact,
      address,
      business,
      products,
      notes,
      createdBy: req.user._id
    });

    await supplier.save();

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update supplier
router.put('/:id', [
  param('id').isMongoId().withMessage('Valid supplier ID is required'),
  ...validateSupplierUpdate
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_suppliers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'nameMyanmar', 'contact', 'address', 'business', 'products', 'notes', 'status', 'tags'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        supplier[field] = req.body[field];
      }
    });

    supplier.updatedBy = req.user._id;
    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete supplier (soft delete)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Valid supplier ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_suppliers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Soft delete
    supplier.isActive = false;
    supplier.status = 'inactive';
    supplier.updatedBy = req.user._id;
    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Record order
router.post('/:id/orders', [
  param('id').isMongoId().withMessage('Valid supplier ID is required'),
  body('orderAmount').isFloat({ min: 0.01 }).withMessage('Order amount must be positive'),
  body('orderDate').optional().isISO8601().withMessage('Valid order date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderAmount, orderDate } = req.body;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_suppliers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Record order
    await supplier.recordOrder(orderAmount, orderDate);

    res.json({
      success: true,
      message: 'Order recorded successfully',
      data: {
        totalOrders: supplier.performance.totalOrders,
        totalPurchases: supplier.financial.totalPurchases,
        averageOrderValue: supplier.financial.averageOrderValue
      }
    });
  } catch (error) {
    console.error('Error recording order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Record payment
router.post('/:id/payments', [
  param('id').isMongoId().withMessage('Valid supplier ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be positive'),
  body('method').isString().trim().notEmpty().withMessage('Payment method is required'),
  body('reference').isString().trim().notEmpty().withMessage('Payment reference is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, method, reference } = req.body;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_suppliers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Record payment
    await supplier.recordPayment(amount, method, reference);

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        totalPayments: supplier.financial.totalPayments,
        outstandingBalance: supplier.financial.outstandingBalance
      }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update performance metrics
router.post('/:id/performance', [
  param('id').isMongoId().withMessage('Valid supplier ID is required'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('onTimeDelivery').optional().isFloat({ min: 0, max: 100 }).withMessage('On-time delivery percentage must be between 0 and 100'),
  body('qualityScore').optional().isFloat({ min: 0, max: 5 }).withMessage('Quality score must be between 0 and 5'),
  body('responseTime').optional().isFloat({ min: 0 }).withMessage('Response time must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, onTimeDelivery, qualityScore, responseTime } = req.body;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_suppliers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update performance metrics
    await supplier.updatePerformanceMetrics({
      rating,
      onTimeDelivery,
      qualityScore,
      responseTime
    });

    res.json({
      success: true,
      message: 'Performance metrics updated successfully',
      data: {
        rating: supplier.performance.rating,
        onTimeDelivery: supplier.performance.onTimeDelivery,
        qualityScore: supplier.performance.qualityScore,
        responseTime: supplier.performance.responseTime,
        performanceScore: supplier.performanceScore
      }
    });
  } catch (error) {
    console.error('Error updating performance metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add certification
router.post('/:id/certifications', [
  param('id').isMongoId().withMessage('Valid supplier ID is required'),
  body('name').isString().trim().notEmpty().withMessage('Certification name is required'),
  body('issuingBody').isString().trim().notEmpty().withMessage('Issuing body is required'),
  body('issueDate').isISO8601().withMessage('Valid issue date is required'),
  body('expiryDate').optional().isISO8601().withMessage('Valid expiry date is required'),
  body('status').optional().isIn(['active', 'expired', 'pending', 'suspended']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, issuingBody, issueDate, expiryDate, status = 'active' } = req.body;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_suppliers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Add certification
    await supplier.addCertification({
      name,
      issuingBody,
      issueDate,
      expiryDate,
      status
    });

    res.json({
      success: true,
      message: 'Certification added successfully',
      data: {
        certifications: supplier.business.certifications
      }
    });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update quality standards
router.post('/:id/quality-standards', [
  param('id').isMongoId().withMessage('Valid supplier ID is required'),
  body('standard').isString().trim().notEmpty().withMessage('Standard name is required'),
  body('level').isString().trim().notEmpty().withMessage('Standard level is required'),
  body('certified').isBoolean().withMessage('Certified status is required'),
  body('lastAudit').optional().isISO8601().withMessage('Valid last audit date is required'),
  body('nextAudit').optional().isISO8601().withMessage('Valid next audit date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { standard, level, certified, lastAudit, nextAudit } = req.body;

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_suppliers')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update quality standards
    await supplier.updateQualityStandards(standard, level, certified, lastAudit, nextAudit);

    res.json({
      success: true,
      message: 'Quality standards updated successfully',
      data: {
        qualityStandards: supplier.business.qualityStandards
      }
    });
  } catch (error) {
    console.error('Error updating quality standards:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get suppliers by category
router.get('/category/:category', [
  param('category').isIn([
    'fresh_produce', 'dairy_eggs', 'meat_seafood', 'bakery', 'frozen_foods',
    'pantry', 'beverages', 'snacks', 'household', 'personal_care',
    'baby_care', 'pet_supplies', 'electronics', 'clothing', 'pharmacy',
    'general', 'specialty'
  ]).withMessage('Valid supplier category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category } = req.params;

    // Get suppliers by category
    const suppliers = await Supplier.findByCategory(category);

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers by category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get high-performing suppliers
router.get('/performance/high-performers', [
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Minimum rating must be between 0 and 5'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { minRating = 4.0, limit = 10 } = req.query;

    // Get high-performing suppliers
    const highPerformers = await Supplier.findHighPerformers(parseFloat(minRating))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: highPerformers
    });
  } catch (error) {
    console.error('Error fetching high performers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get suppliers by type
router.get('/type/:type', [
  param('type').isIn([
    'manufacturer', 'distributor', 'wholesaler', 'importer', 'local_producer',
    'farm', 'fishery', 'bakery', 'dairy', 'meat_processor', 'beverage_producer'
  ]).withMessage('Valid supplier type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type } = req.params;

    // Get suppliers by type
    const suppliers = await Supplier.findByType(type);

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers by type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get suppliers needing review
router.get('/performance/needing-review', async (req, res) => {
  try {
    // Get suppliers needing review
    const suppliersNeedingReview = await Supplier.findNeedingReview();

    res.json({
      success: true,
      data: suppliersNeedingReview
    });
  } catch (error) {
    console.error('Error fetching suppliers needing review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get supplier statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // Get supplier statistics
    const stats = await Supplier.getSupplierStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching supplier statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get suppliers by performance
router.get('/stats/by-performance', async (req, res) => {
  try {
    const pipeline = [
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gte: ['$performance.rating', 4.0] },
              'excellent',
              {
                $cond: [
                  { $gte: ['$performance.rating', 3.0] },
                  'good',
                  'needs_improvement'
                ]
              }
            ]
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$performance.rating' },
          averageOnTimeDelivery: { $avg: '$performance.onTimeDelivery' },
          totalPurchases: { $sum: '$financial.totalPurchases' }
        }
      },
      { $sort: { count: -1 } }
    ];

    const results = await Supplier.aggregate(pipeline);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching suppliers by performance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;