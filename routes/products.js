const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, ownerOrManager } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    // Only owner can see all products, employees see active products
    if (req.user.role !== 'owner') {
      query.isActive = true;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Owner or Manager)
router.post('/', protect, ownerOrManager, [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('costPrice').isNumeric().withMessage('Cost price must be a number'),
  body('sellingPrice').isNumeric().withMessage('Selling price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      barcode,
      category,
      brand,
      unit,
      costPrice,
      sellingPrice,
      minStockLevel,
      supplier
    } = req.body;

    // Check if barcode already exists
    if (barcode) {
      const existingProduct = await Product.findOne({ barcode });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this barcode already exists' });
      }
    }

    const product = await Product.create({
      name,
      description,
      barcode,
      category,
      brand,
      unit,
      costPrice,
      sellingPrice,
      minStockLevel,
      supplier,
      createdBy: req.user._id
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Owner or Manager)
router.put('/:id', protect, ownerOrManager, [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('costPrice').optional().isNumeric().withMessage('Cost price must be a number'),
  body('sellingPrice').optional().isNumeric().withMessage('Selling price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if barcode already exists (if updating barcode)
    if (req.body.barcode && req.body.barcode !== product.barcode) {
      const existingProduct = await Product.findOne({ 
        barcode: req.body.barcode,
        _id: { $ne: product._id }
      });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this barcode already exists' });
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Owner or Manager)
router.delete('/:id', protect, ownerOrManager, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Soft delete - just mark as inactive
    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deactivated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Private
router.get('/categories/list', protect, async (req, res) => {
  try {
    const categories = [
      'Food & Beverages',
      'Personal Care',
      'Household Items',
      'Snacks & Confectionery',
      'Dairy Products',
      'Frozen Foods',
      'Health & Medicine',
      'Stationery',
      'Electronics',
      'Other'
    ];

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Search products by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Private
router.get('/barcode/:barcode', protect, async (req, res) => {
  try {
    const product = await Product.findOne({ 
      barcode: req.params.barcode,
      isActive: true 
    }).populate('createdBy', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;