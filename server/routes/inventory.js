const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { protect, authorize, checkPermission, checkStoreAccess } = require('../middleware/auth');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Store = require('../models/Store');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Validation middleware
const validateInventory = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('storeId').isMongoId().withMessage('Valid store ID is required'),
  body('currentStock').isInt({ min: 0 }).withMessage('Current stock must be non-negative'),
  body('minimumStock').isInt({ min: 0 }).withMessage('Minimum stock must be non-negative'),
  body('maximumStock').optional().isInt({ min: 0 }).withMessage('Maximum stock must be non-negative'),
  body('reorderPoint').optional().isInt({ min: 0 }).withMessage('Reorder point must be non-negative'),
  body('reorderQuantity').optional().isInt({ min: 1 }).withMessage('Reorder quantity must be at least 1')
];

const validateStockMovement = [
  body('type').isIn(['in', 'out', 'adjustment', 'transfer_in', 'transfer_out', 'damaged', 'expired', 'returned']).withMessage('Valid movement type is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('reason').isString().trim().notEmpty().withMessage('Reason is required'),
  body('reference').optional().isString().trim().withMessage('Reference must be a string'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be positive'),
  body('notes').optional().isString().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

// Get all inventory items with filtering and pagination
router.get('/', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('productId').optional().isMongoId().withMessage('Valid product ID is required'),
  query('stockStatus').optional().isIn(['normal', 'low_stock', 'out_of_stock', 'overstock']).withMessage('Valid stock status is required'),
  query('category').optional().isString().trim().withMessage('Category must be a string'),
  query('search').optional().isString().trim().isLength({ min: 2 }).withMessage('Search term must be at least 2 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['currentStock', 'lastUpdated', 'stockValue.retail']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      storeId,
      productId,
      stockStatus,
      category,
      search,
      page = 1,
      limit = 20,
      sortBy = 'lastUpdated',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_inventory')) {
      // If no store specified and user can't view all inventory, restrict to their store
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    if (productId) query.productId = productId;
    
    if (stockStatus) {
      switch (stockStatus) {
        case 'out_of_stock':
          query.currentStock = 0;
          break;
        case 'low_stock':
          query.$expr = { $lte: ['$currentStock', '$minimumStock'] };
          break;
        case 'overstock':
          query.$expr = { $and: [
            { $ne: ['$maximumStock', null] },
            { $gte: ['$currentStock', '$maximumStock'] }
          ]};
          break;
        case 'normal':
          query.$expr = { $and: [
            { $gt: ['$currentStock', 0] },
            { $gt: ['$currentStock', '$minimumStock'] },
            { $or: [
              { $eq: ['$maximumStock', null] },
              { $lt: ['$currentStock', '$maximumStock'] }
            ]}
          ]};
          break;
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const inventory = await Inventory.find(query)
      .populate('productId', 'name sku category subcategory brand images')
      .populate('storeId', 'name code')
      .populate('supplier.supplierId', 'name supplierCode')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Inventory.countDocuments(query);

    res.json({
      success: true,
      data: inventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single inventory item by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Valid inventory ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inventory = await Inventory.findById(req.params.id)
      .populate('productId', 'name sku category subcategory brand images description')
      .populate('storeId', 'name code address')
      .populate('supplier.supplierId', 'name supplierCode contact')
      .populate('stockMovements.performedBy', 'username personalInfo.firstName personalInfo.lastName');

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, inventory.storeId)) {
      return res.status(403).json({ message: 'Access denied to this inventory item' });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new inventory item
router.post('/', [
  ...validateInventory
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      productId,
      storeId,
      currentStock,
      minimumStock,
      maximumStock,
      reorderPoint,
      reorderQuantity,
      location,
      supplier,
      expiryTracking,
      notes
    } = req.body;

    // Check store access
    if (!checkStoreAccess(req.user, storeId)) {
      return res.status(403).json({ message: 'Access denied to specified store' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_inventory')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: 'Product not found' });
    }

    // Check if inventory item already exists for this product and store
    const existingInventory = await Inventory.findOne({ productId, storeId, isActive: true });
    if (existingInventory) {
      return res.status(400).json({ message: 'Inventory item already exists for this product and store' });
    }

    // Create inventory item
    const inventory = new Inventory({
      productId,
      storeId,
      currentStock,
      minimumStock,
      maximumStock,
      reorderPoint,
      reorderQuantity,
      location,
      supplier,
      expiryTracking,
      notes,
      createdBy: req.user._id
    });

    await inventory.save();

    // Populate references for response
    await inventory.populate([
      { path: 'productId', select: 'name sku category' },
      { path: 'storeId', select: 'name code' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update inventory item
router.put('/:id', [
  param('id').isMongoId().withMessage('Valid inventory ID is required'),
  body('currentStock').optional().isInt({ min: 0 }).withMessage('Current stock must be non-negative'),
  body('minimumStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be non-negative'),
  body('maximumStock').optional().isInt({ min: 0 }).withMessage('Maximum stock must be non-negative'),
  body('reorderPoint').optional().isInt({ min: 0 }).withMessage('Reorder point must be non-negative'),
  body('reorderQuantity').optional().isInt({ min: 1 }).withMessage('Reorder quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, inventory.storeId)) {
      return res.status(403).json({ message: 'Access denied to this inventory item' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_inventory')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'currentStock', 'minimumStock', 'maximumStock', 'reorderPoint', 
      'reorderQuantity', 'location', 'supplier', 'expiryTracking', 'notes'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        inventory[field] = req.body[field];
      }
    });

    inventory.updatedBy = req.user._id;
    await inventory.save();

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete inventory item (soft delete)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Valid inventory ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, inventory.storeId)) {
      return res.status(403).json({ message: 'Access denied to this inventory item' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_inventory')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Soft delete
    inventory.isActive = false;
    inventory.updatedBy = req.user._id;
    await inventory.save();

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add stock movement
router.post('/:id/movements', [
  param('id').isMongoId().withMessage('Valid inventory ID is required'),
  ...validateStockMovement
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, quantity, reason, reference, cost, notes } = req.body;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, inventory.storeId)) {
      return res.status(403).json({ message: 'Access denied to this inventory item' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_inventory')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Add stock movement
    await inventory.addStockMovement({
      type,
      quantity,
      reason,
      reference,
      cost,
      notes,
      performedBy: req.user._id
    });

    res.json({
      success: true,
      message: 'Stock movement recorded successfully',
      data: {
        currentStock: inventory.currentStock,
        availableStock: inventory.availableStock,
        stockStatus: inventory.stockStatus,
        stockStatusDisplay: inventory.stockStatusDisplay
      }
    });
  } catch (error) {
    console.error('Error recording stock movement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reserve stock
router.post('/:id/reserve', [
  param('id').isMongoId().withMessage('Valid inventory ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity } = req.body;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, inventory.storeId)) {
      return res.status(403).json({ message: 'Access denied to this inventory item' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_inventory')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Reserve stock
    await inventory.reserveStock(quantity);

    res.json({
      success: true,
      message: 'Stock reserved successfully',
      data: {
        currentStock: inventory.currentStock,
        reservedStock: inventory.reservedStock,
        availableStock: inventory.availableStock
      }
    });
  } catch (error) {
    console.error('Error reserving stock:', error);
    if (error.message.includes('Insufficient')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Release reserved stock
router.post('/:id/release', [
  param('id').isMongoId().withMessage('Valid inventory ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity } = req.body;

    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, inventory.storeId)) {
      return res.status(403).json({ message: 'Access denied to this inventory item' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_inventory')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Release reserved stock
    await inventory.releaseReservedStock(quantity);

    res.json({
      success: true,
      message: 'Reserved stock released successfully',
      data: {
        currentStock: inventory.currentStock,
        reservedStock: inventory.reservedStock,
        availableStock: inventory.availableStock
      }
    });
  } catch (error) {
    console.error('Error releasing reserved stock:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get reorder suggestions
router.get('/reorder/suggestions', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('urgency').optional().isIn(['low', 'high', 'critical']).withMessage('Valid urgency level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, urgency } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_inventory')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    // Get inventory items that need reordering
    const inventoryItems = await Inventory.find(query)
      .populate('productId', 'name sku category')
      .populate('storeId', 'name code');

    const reorderSuggestions = inventoryItems
      .map(item => item.getReorderSuggestion())
      .filter(suggestion => suggestion !== null);

    // Filter by urgency if specified
    let filteredSuggestions = reorderSuggestions;
    if (urgency) {
      filteredSuggestions = reorderSuggestions.filter(suggestion => suggestion.urgency === urgency);
    }

    // Sort by urgency (critical > high > low)
    const urgencyOrder = { critical: 3, high: 2, low: 1 };
    filteredSuggestions.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);

    res.json({
      success: true,
      data: filteredSuggestions
    });
  } catch (error) {
    console.error('Error fetching reorder suggestions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get low stock items
router.get('/alerts/low-stock', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId } = req.query;

    // Check store access
    if (storeId && !checkStoreAccess(req.user, storeId)) {
      return res.status(403).json({ message: 'Access denied to this store' });
    }

    // Get low stock items
    const lowStockItems = await Inventory.findLowStock(storeId);

    res.json({
      success: true,
      data: lowStockItems
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get out of stock items
router.get('/alerts/out-of-stock', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId } = req.query;

    // Check store access
    if (storeId && !checkStoreAccess(req.user, storeId)) {
      return res.status(403).json({ message: 'Access denied to this store' });
    }

    // Get out of stock items
    const outOfStockItems = await Inventory.findOutOfStock(storeId);

    res.json({
      success: true,
      data: outOfStockItems
    });
  } catch (error) {
    console.error('Error fetching out of stock items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get items expiring soon
router.get('/alerts/expiring-soon', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, days = 30 } = req.query;

    // Check store access
    if (storeId && !checkStoreAccess(req.user, storeId)) {
      return res.status(403).json({ message: 'Access denied to this store' });
    }

    // Get items expiring soon
    const expiringItems = await Inventory.findExpiringSoon(parseInt(days), storeId);

    res.json({
      success: true,
      data: expiringItems
    });
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get inventory statistics
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
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_inventory')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    // Get inventory statistics
    const stats = await Inventory.getInventoryStats(storeId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching inventory statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get inventory by category
router.get('/stats/by-category', [
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
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_inventory')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          count: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          totalValue: { $sum: '$stockValue.retail' },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$currentStock', '$minimumStock'] }, 1, 0]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    const results = await Inventory.aggregate(pipeline);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching inventory by category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;