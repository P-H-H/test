const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { protect, authorize, checkPermission, checkStoreAccess } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Validation middleware
const validateSale = [
  body('storeId').isMongoId().withMessage('Valid store ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
  body('payment.method').isIn(['cash', 'mobile_money', 'bank_transfer', 'credit_card', 'debit_card', 'voucher']).withMessage('Valid payment method is required'),
  body('payment.amountReceived').isFloat({ min: 0 }).withMessage('Amount received must be positive'),
  body('pricing.currency').optional().isIn(['MMK', 'USD']).withMessage('Currency must be MMK or USD')
];

const validatePaymentMethod = [
  body('payment.mobileProvider').if(body('payment.method').equals('mobile_money')).notEmpty().withMessage('Mobile provider is required for mobile money payments'),
  body('payment.bankName').if(body('payment.method').equals('bank_transfer')).notEmpty().withMessage('Bank name is required for bank transfers'),
  body('payment.referenceNumber').if(body('payment.method').in(['bank_transfer', 'credit_card', 'debit_card'])).notEmpty().withMessage('Reference number is required')
];

// Get all sales with filtering and pagination
router.get('/', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('customerId').optional().isMongoId().withMessage('Valid customer ID is required'),
  query('status').optional().isIn(['completed', 'pending', 'cancelled', 'refunded', 'partially_refunded']).withMessage('Valid status is required'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'pricing.total', 'totalItems']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      storeId,
      customerId,
      status,
      startDate,
      endDate,
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
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_sales')) {
      // If no store specified and user can't view all sales, restrict to their store
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    if (customerId) query.customerId = customerId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sales = await Sale.find(query)
      .populate('storeId', 'name code')
      .populate('customerId', 'name phone')
      .populate('staffId', 'personalInfo.firstName personalInfo.lastName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      data: sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single sale by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Valid sale ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sale = await Sale.findById(req.params.id)
      .populate('storeId', 'name code address')
      .populate('customerId', 'name phone email address')
      .populate('staffId', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('items.productId', 'name sku category images');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, sale.storeId)) {
      return res.status(403).json({ message: 'Access denied to this sale' });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new sale (POS)
router.post('/', [
  ...validateSale,
  ...validatePaymentMethod
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      storeId,
      customerId,
      items,
      payment,
      pricing,
      notes,
      saleType = 'retail'
    } = req.body;

    // Check store access
    if (!checkStoreAccess(req.user, storeId)) {
      return res.status(403).json({ message: 'Access denied to this store' });
    }

    // Validate items and check stock
    const validatedItems = [];
    let totalSubtotal = 0;
    let totalTax = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      // Check inventory
      const inventory = await Inventory.findOne({ productId: item.productId, storeId });
      if (!inventory || inventory.availableStock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${inventory?.availableStock || 0}` 
        });
      }

      // Calculate item totals
      const itemSubtotal = item.unitPrice * item.quantity;
      const itemDiscount = (itemSubtotal * (item.discountPercentage || 0)) / 100;
      const itemTax = ((itemSubtotal - itemDiscount) * (item.taxRate || 0)) / 100;

      validatedItems.push({
        ...item,
        productName: product.name,
        productNameMyanmar: product.nameMyanmar,
        sku: product.sku,
        barcode: product.barcode,
        subtotal: itemSubtotal - itemDiscount,
        total: itemSubtotal - itemDiscount + itemTax
      });

      totalSubtotal += itemSubtotal;
      totalTax += itemTax;
    }

    // Calculate sale totals
    const saleDiscount = (totalSubtotal * (pricing.discountPercentage || 0)) / 100;
    const saleTax = totalTax + ((totalSubtotal - saleDiscount) * (pricing.taxRate || 0)) / 100;
    const saleTotal = totalSubtotal - saleDiscount + saleTax;

    // Generate sale number
    const saleNumber = await Sale.generateSaleNumber(storeId);

    // Create sale
    const sale = new Sale({
      saleNumber,
      storeId,
      customerId,
      staffId: req.user._id,
      items: validatedItems,
      payment: {
        ...payment,
        change: Math.max(0, payment.amountReceived - saleTotal)
      },
      pricing: {
        subtotal: totalSubtotal,
        discountPercentage: pricing.discountPercentage || 0,
        discountAmount: saleDiscount,
        taxRate: pricing.taxRate || 0,
        taxAmount: saleTax,
        total: saleTotal,
        currency: pricing.currency || 'MMK'
      },
      saleType,
      notes,
      customerInfo: customerId ? undefined : {
        name: req.body.customerInfo?.name,
        phone: req.body.customerInfo?.phone,
        email: req.body.customerInfo?.email
      }
    });

    await sale.save();

    // Update inventory
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId, storeId },
        { 
          $inc: { currentStock: -item.quantity },
          $push: {
            stockMovements: {
              type: 'out',
              quantity: item.quantity,
              reason: 'Sale',
              reference: sale.saleNumber,
              performedBy: req.user._id
            }
          }
        }
      );
    }

    // Update customer if exists
    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: {
          'purchaseHistory.totalPurchases': 1,
          'purchaseHistory.totalSpent': saleTotal
        },
        'purchaseHistory.lastPurchaseDate': new Date()
      });
    }

    // Populate references for response
    await sale.populate([
      { path: 'storeId', select: 'name code' },
      { path: 'customerId', select: 'name phone' },
      { path: 'staffId', select: 'personalInfo.firstName personalInfo.lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update sale
router.put('/:id', [
  param('id').isMongoId().withMessage('Valid sale ID is required'),
  body('status').optional().isIn(['completed', 'pending', 'cancelled', 'refunded', 'partially_refunded']).withMessage('Valid status is required'),
  body('notes').optional().isString().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, sale.storeId)) {
      return res.status(403).json({ message: 'Access denied to this sale' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_sales')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update allowed fields
    const allowedUpdates = ['status', 'notes'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        sale[field] = req.body[field];
      }
    });

    sale.updatedBy = req.user._id;
    await sale.save();

    res.json({
      success: true,
      message: 'Sale updated successfully',
      data: sale
    });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Process refund
router.post('/:id/refund', [
  param('id').isMongoId().withMessage('Valid sale ID is required'),
  body('refundAmount').isFloat({ min: 0.01 }).withMessage('Refund amount must be positive'),
  body('reason').isString().trim().notEmpty().withMessage('Refund reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { refundAmount, reason } = req.body;

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, sale.storeId)) {
      return res.status(403).json({ message: 'Access denied to this sale' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_sales')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Process refund
    await sale.calculateRefund(refundAmount, reason);
    sale.refund.refundedBy = req.user._id;

    await sale.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: sale
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    if (error.message.includes('cannot exceed')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get sales statistics
router.get('/stats/overview', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, startDate, endDate } = req.query;

    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    // Build query
    const query = {
      createdAt: { $gte: start, $lte: end },
      isActive: true,
      status: 'completed'
    };

    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_sales')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    // Get sales statistics
    const stats = await Sale.getSalesStats(query.storeId, start, end);

    // Get additional metrics
    const totalSales = await Sale.countDocuments(query);
    const uniqueCustomers = await Sale.distinct('customerId', query).countDocuments();
    const averageOrderValue = totalSales > 0 ? stats.totalSales / totalSales : 0;

    res.json({
      success: true,
      data: {
        period: { start, end },
        totalSales: stats.totalSales,
        totalTransactions: stats.totalTransactions,
        totalItems: stats.totalItems,
        averageTransactionValue: averageOrderValue,
        uniqueCustomers,
        currency: 'MMK'
      }
    });
  } catch (error) {
    console.error('Error fetching sales statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get sales by date range
router.get('/stats/by-date', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required'),
  query('groupBy').isIn(['day', 'week', 'month']).withMessage('Group by must be day, week, or month')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, startDate, endDate, groupBy } = req.query;

    // Build query
    const query = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isActive: true,
      status: 'completed'
    };

    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_sales')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    // Build aggregation pipeline
    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        dateFormat = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
        break;
      case 'month':
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
    }

    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: dateFormat,
          totalSales: { $sum: '$pricing.total' },
          totalTransactions: { $sum: 1 },
          totalItems: { $sum: '$totalItems' },
          averageOrderValue: { $avg: '$pricing.total' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const results = await Sale.aggregate(pipeline);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching sales by date:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get top selling products
router.get('/stats/top-products', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, startDate, endDate, limit = 10 } = req.query;

    // Build query
    const query = {
      createdAt: { $gte: new Date(startDate || new Date().setDate(new Date().getDate() - 30)), $lte: new Date(endDate || new Date()) },
      isActive: true,
      status: 'completed'
    };

    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_sales')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    const pipeline = [
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          averagePrice: { $avg: '$items.unitPrice' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ];

    const results = await Sale.aggregate(pipeline);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;