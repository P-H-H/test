const express = require('express');
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// @desc    Get sales for a store
// @route   GET /api/sales/:storeId
// @access  Private
router.get('/:storeId', protect, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    // Check if user has access to this store
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(storeId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { store: storeId, isVoid: false };

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .populate('cashier', 'name')
      .populate('store', 'name')
      .populate('items.product', 'name unit')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(query);

    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single sale
// @route   GET /api/sales/receipt/:id
// @access  Private
router.get('/receipt/:id', protect, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('cashier', 'name')
      .populate('store', 'name address phone')
      .populate('items.product', 'name unit barcode');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Check access permissions
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(sale.store._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
router.post('/', protect, [
  body('storeId').notEmpty().withMessage('Store ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['cash', 'card', 'mobile_payment', 'credit']).withMessage('Invalid payment method'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number')
], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      storeId,
      items,
      subtotal,
      tax = 0,
      discount = 0,
      totalAmount,
      paymentMethod,
      customerInfo,
      notes
    } = req.body;

    // Check if user has access to this store
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(storeId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate store exists
    const store = await Store.findById(storeId).session(session);
    if (!store) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Store not found' });
    }

    // Process each item and check inventory
    const saleItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      // Check inventory
      const inventory = await Inventory.findOne({
        store: storeId,
        product: item.productId
      }).session(session);

      if (!inventory || inventory.quantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${inventory ? inventory.quantity : 0}, Required: ${item.quantity}` 
        });
      }

      const unitPrice = product.sellingPrice;
      const totalPrice = unitPrice * item.quantity;

      saleItems.push({
        product: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice
      });

      calculatedSubtotal += totalPrice;

      // Update inventory
      inventory.quantity -= item.quantity;
      inventory.lastUpdatedBy = req.user._id;
      await inventory.save({ session });
    }

    // Validate totals
    if (Math.abs(calculatedSubtotal - subtotal) > 0.01) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Subtotal mismatch' });
    }

    const calculatedTotal = subtotal + tax - discount;
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Total amount mismatch' });
    }

    // Create sale
    const sale = new Sale({
      store: storeId,
      items: saleItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      customerInfo,
      cashier: req.user._id,
      notes
    });

    await sale.save({ session });
    await session.commitTransaction();
    session.endSession();

    const populatedSale = await Sale.findById(sale._id)
      .populate('cashier', 'name')
      .populate('store', 'name')
      .populate('items.product', 'name unit');

    res.status(201).json(populatedSale);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Void a sale
// @route   PUT /api/sales/:id/void
// @access  Private
router.put('/:id/void', protect, [
  body('reason').notEmpty().withMessage('Void reason is required')
], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ errors: errors.array() });
    }

    const sale = await Sale.findById(req.params.id).session(session);
    
    if (!sale) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Sale not found' });
    }

    if (sale.isVoid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Sale is already voided' });
    }

    // Check access permissions
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(sale.store.toString())) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Access denied' });
    }

    // Restore inventory
    for (const item of sale.items) {
      const inventory = await Inventory.findOne({
        store: sale.store,
        product: item.product
      }).session(session);

      if (inventory) {
        inventory.quantity += item.quantity;
        inventory.lastUpdatedBy = req.user._id;
        await inventory.save({ session });
      }
    }

    // Mark sale as void
    sale.isVoid = true;
    sale.voidReason = req.body.reason;
    sale.voidedBy = req.user._id;
    sale.voidedAt = new Date();

    await sale.save({ session });
    await session.commitTransaction();
    session.endSession();

    const populatedSale = await Sale.findById(sale._id)
      .populate('cashier', 'name')
      .populate('voidedBy', 'name')
      .populate('store', 'name');

    res.json(populatedSale);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get sales analytics for a store
// @route   GET /api/sales/analytics/:storeId
// @access  Private
router.get('/analytics/:storeId', protect, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { period = 'today' } = req.query;

    // Check if user has access to this store
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(storeId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    }

    const analytics = await Sale.aggregate([
      {
        $match: {
          store: mongoose.Types.ObjectId(storeId),
          isVoid: false,
          createdAt: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalItems: { $sum: { $sum: '$items.quantity' } },
          averageSale: { $avg: '$totalAmount' },
          paymentMethods: {
            $push: '$paymentMethod'
          }
        }
      },
      {
        $project: {
          totalSales: 1,
          totalRevenue: 1,
          totalItems: 1,
          averageSale: { $round: ['$averageSale', 2] },
          paymentBreakdown: {
            cash: {
              $size: {
                $filter: {
                  input: '$paymentMethods',
                  cond: { $eq: ['$$this', 'cash'] }
                }
              }
            },
            card: {
              $size: {
                $filter: {
                  input: '$paymentMethods',
                  cond: { $eq: ['$$this', 'card'] }
                }
              }
            },
            mobile_payment: {
              $size: {
                $filter: {
                  input: '$paymentMethods',
                  cond: { $eq: ['$$this', 'mobile_payment'] }
                }
              }
            },
            credit: {
              $size: {
                $filter: {
                  input: '$paymentMethods',
                  cond: { $eq: ['$$this', 'credit'] }
                }
              }
            }
          }
        }
      }
    ]);

    const result = analytics.length > 0 ? analytics[0] : {
      totalSales: 0,
      totalRevenue: 0,
      totalItems: 0,
      averageSale: 0,
      paymentBreakdown: { cash: 0, card: 0, mobile_payment: 0, credit: 0 }
    };

    // Get top selling products
    const topProducts = await Sale.aggregate([
      {
        $match: {
          store: mongoose.Types.ObjectId(storeId),
          isVoid: false,
          createdAt: { $gte: startDate, $lt: endDate }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    result.topProducts = topProducts;
    result.period = period;
    result.dateRange = { startDate, endDate };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;