const express = require('express');
const { body, validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { protect, ownerOrManager } = require('../middleware/auth');

const router = express.Router();

// @desc    Get inventory for a store
// @route   GET /api/inventory/:storeId
// @access  Private
router.get('/:storeId', protect, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { status, category, search, page = 1, limit = 50 } = req.query;

    // Check if user has access to this store
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(storeId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { store: storeId };
    
    // Build product filter for population
    let productFilter = { isActive: true };
    if (category) {
      productFilter.category = category;
    }

    let inventoryQuery = Inventory.find(query)
      .populate({
        path: 'product',
        match: productFilter,
        select: 'name category brand unit costPrice sellingPrice minStockLevel'
      })
      .populate('lastUpdatedBy', 'name')
      .populate('store', 'name');

    // Apply search filter
    if (search) {
      const products = await Product.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } }
        ],
        isActive: true
      }).select('_id');
      
      const productIds = products.map(p => p._id);
      query.product = { $in: productIds };
      inventoryQuery = Inventory.find(query)
        .populate('product', 'name category brand unit costPrice sellingPrice minStockLevel')
        .populate('lastUpdatedBy', 'name')
        .populate('store', 'name');
    }

    const inventory = await inventoryQuery
      .sort({ 'product.name': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out items where product is null (due to populate match)
    const filteredInventory = inventory.filter(item => item.product);

    // Apply status filter after population
    let finalInventory = filteredInventory;
    if (status) {
      finalInventory = filteredInventory.filter(item => {
        const stockStatus = item.quantity === 0 ? 'outofstock' : 
                          item.quantity <= item.reorderLevel ? 'lowstock' : 'instock';
        return stockStatus === status.toLowerCase().replace(' ', '');
      });
    }

    const total = finalInventory.length;

    res.json({
      inventory: finalInventory,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add product to store inventory
// @route   POST /api/inventory
// @access  Private
router.post('/', protect, [
  body('storeId').notEmpty().withMessage('Store ID is required'),
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, productId, quantity, reorderLevel, location } = req.body;

    // Check if user has access to this store
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(storeId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if store and product exist
    const store = await Store.findById(storeId);
    const product = await Product.findById(productId);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if inventory item already exists
    let inventory = await Inventory.findOne({ store: storeId, product: productId });

    if (inventory) {
      // Update existing inventory
      inventory.quantity += Number(quantity);
      inventory.reorderLevel = reorderLevel || inventory.reorderLevel;
      inventory.location = location || inventory.location;
      inventory.lastRestocked = new Date();
      inventory.lastUpdatedBy = req.user._id;
    } else {
      // Create new inventory item
      inventory = await Inventory.create({
        store: storeId,
        product: productId,
        quantity: Number(quantity),
        reorderLevel: reorderLevel || product.minStockLevel,
        location,
        lastUpdatedBy: req.user._id
      });
    }

    await inventory.save();

    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('product', 'name category brand unit costPrice sellingPrice')
      .populate('store', 'name')
      .populate('lastUpdatedBy', 'name');

    res.status(201).json(populatedInventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
router.put('/:id', protect, [
  body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
  body('reorderLevel').optional().isNumeric().withMessage('Reorder level must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check if user has access to this store
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(inventory.store.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { quantity, reorderLevel, location } = req.body;

    if (quantity !== undefined) inventory.quantity = quantity;
    if (reorderLevel !== undefined) inventory.reorderLevel = reorderLevel;
    if (location !== undefined) inventory.location = location;
    
    inventory.lastUpdatedBy = req.user._id;
    await inventory.save();

    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('product', 'name category brand unit costPrice sellingPrice')
      .populate('store', 'name')
      .populate('lastUpdatedBy', 'name');

    res.json(populatedInventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Adjust inventory (add/subtract stock)
// @route   PUT /api/inventory/:id/adjust
// @access  Private
router.put('/:id/adjust', protect, [
  body('adjustment').isNumeric().withMessage('Adjustment must be a number'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check if user has access to this store
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(inventory.store.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { adjustment, reason } = req.body;
    const newQuantity = inventory.quantity + Number(adjustment);

    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Adjustment would result in negative inventory' });
    }

    inventory.quantity = newQuantity;
    inventory.lastUpdatedBy = req.user._id;
    
    // Log the adjustment (you might want to create an AdjustmentLog model for this)
    console.log(`Inventory adjustment: ${adjustment} for product ${inventory.product} by ${req.user.name}. Reason: ${reason}`);
    
    await inventory.save();

    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('product', 'name category brand unit costPrice sellingPrice')
      .populate('store', 'name')
      .populate('lastUpdatedBy', 'name');

    res.json(populatedInventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock/:storeId
// @access  Private
router.get('/low-stock/:storeId', protect, async (req, res) => {
  try {
    const { storeId } = req.params;

    // Check if user has access to this store
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(storeId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const lowStockItems = await Inventory.find({ 
      store: storeId,
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    })
      .populate('product', 'name category brand unit costPrice sellingPrice')
      .populate('store', 'name')
      .sort({ quantity: 1 });

    res.json(lowStockItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get inventory summary for store
// @route   GET /api/inventory/summary/:storeId
// @access  Private
router.get('/summary/:storeId', protect, async (req, res) => {
  try {
    const { storeId } = req.params;

    // Check if user has access to this store
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(storeId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const summary = await Inventory.aggregate([
      { $match: { store: mongoose.Types.ObjectId(storeId) } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$productInfo.costPrice'] } },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: { $cond: [{ $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$reorderLevel'] }] }, 1, 0] }
          },
          inStock: {
            $sum: { $cond: [{ $gt: ['$quantity', '$reorderLevel'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = summary.length > 0 ? summary[0] : {
      totalProducts: 0,
      totalValue: 0,
      outOfStock: 0,
      lowStock: 0,
      inStock: 0
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;