const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const moment = require('moment');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res, next) => {
  try {
    const {
      items,
      paymentMethod,
      customer,
      notes,
      taxRate,
      store
    } = req.body;

    // Use employee's assigned store if not specified
    const saleStore = store || (req.user.assignedStore ? req.user.assignedStore._id : null);

    if (!saleStore) {
      return res.status(400).json({
        success: false,
        message: 'Store is required'
      });
    }

    // For employees, ensure they can only create sales for their assigned store
    if (req.user.role === 'employee') {
      if (!req.user.assignedStore || req.user.assignedStore._id.toString() !== saleStore.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create sales for this store'
        });
      }
    }

    // Validate and process items
    const processedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      // Check inventory
      const storeInventory = product.inventory.find(inv => 
        inv.store.toString() === saleStore.toString()
      );

      if (!storeInventory || storeInventory.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for product: ${product.name}`
        });
      }

      // Calculate item total
      const unitPrice = item.unitPrice || product.pricing.sellingPrice;
      const totalPrice = unitPrice * item.quantity;
      const discount = item.discount || 0;

      processedItems.push({
        product: product._id,
        productName: product.name,
        barcode: product.barcode,
        quantity: item.quantity,
        unitPrice,
        totalPrice: totalPrice - discount,
        discount,
        discountType: item.discountType || 'fixed'
      });
    }

    // Create sale
    const saleData = {
      store: saleStore,
      employee: req.user._id,
      items: processedItems,
      paymentMethod,
      customer,
      notes,
      taxRate: taxRate || 0.08 // Default 8% tax
    };

    const sale = await Sale.create(saleData);

    // Update inventory and create stock movements
    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      const storeInventory = product.inventory.find(inv => 
        inv.store.toString() === saleStore.toString()
      );

      const previousQuantity = storeInventory.quantity;
      storeInventory.quantity -= item.quantity;
      await product.save();

      // Create stock movement record
      await StockMovement.create({
        product: item.product,
        store: saleStore,
        movementType: 'out',
        quantity: -item.quantity,
        previousQuantity,
        newQuantity: storeInventory.quantity,
        reason: 'Sale transaction',
        reference: {
          referenceType: 'sale',
          referenceId: sale._id
        },
        performedBy: req.user._id
      });
    }

    // Populate sale data for response
    const populatedSale = await Sale.findById(sale._id)
      .populate('store', 'name code')
      .populate('employee', 'firstName lastName')
      .populate('items.product', 'name barcode');

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: {
        sale: populatedSale
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      store,
      startDate,
      endDate,
      paymentMethod,
      employee
    } = req.query;

    // Build query
    let query = {};

    // For employees, only show sales from their assigned store
    if (req.user.role === 'employee' && req.user.assignedStore) {
      query.store = req.user.assignedStore._id;
    } else if (store) {
      query.store = store;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Employee filter (for owners)
    if (employee && req.user.role === 'owner') {
      query.employee = employee;
    }

    const sales = await Sale.find(query)
      .populate('store', 'name code')
      .populate('employee', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sales.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: {
        sales
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('store', 'name code address phone')
      .populate('employee', 'firstName lastName email')
      .populate('items.product', 'name barcode sku');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Check authorization
    if (req.user.role === 'employee') {
      if (!req.user.assignedStore || 
          sale.store._id.toString() !== req.user.assignedStore._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this sale'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        sale
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refund sale
// @route   PUT /api/sales/:id/refund
// @access  Private
const refundSale = async (req, res, next) => {
  try {
    const { refundAmount, refundReason } = req.body;

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    if (sale.refunded) {
      return res.status(400).json({
        success: false,
        message: 'Sale has already been refunded'
      });
    }

    // Check authorization
    if (req.user.role === 'employee') {
      if (!req.user.assignedStore || 
          sale.store.toString() !== req.user.assignedStore._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to refund this sale'
        });
      }
    }

    // Update sale
    sale.refunded = true;
    sale.refundAmount = refundAmount || sale.totalAmount;
    sale.refundReason = refundReason;
    sale.refundDate = new Date();
    await sale.save();

    // Restore inventory
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      const storeInventory = product.inventory.find(inv => 
        inv.store.toString() === sale.store.toString()
      );

      if (storeInventory) {
        const previousQuantity = storeInventory.quantity;
        storeInventory.quantity += item.quantity;
        await product.save();

        // Create stock movement record
        await StockMovement.create({
          product: item.product,
          store: sale.store,
          movementType: 'return',
          quantity: item.quantity,
          previousQuantity,
          newQuantity: storeInventory.quantity,
          reason: 'Sale refund',
          reference: {
            referenceType: 'return',
            referenceId: sale._id
          },
          performedBy: req.user._id
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Sale refunded successfully',
      data: {
        sale
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales analytics
// @route   GET /api/sales/analytics
// @access  Private
const getSalesAnalytics = async (req, res, next) => {
  try {
    const {
      period = 'today',
      store,
      startDate,
      endDate
    } = req.query;

    // Build query
    let query = { refunded: false };

    // For employees, only show analytics from their assigned store
    if (req.user.role === 'employee' && req.user.assignedStore) {
      query.store = req.user.assignedStore._id;
    } else if (store) {
      query.store = store;
    }

    // Date range based on period
    let dateRange = {};
    const now = moment();

    switch (period) {
      case 'today':
        dateRange = {
          $gte: now.startOf('day').toDate(),
          $lte: now.endOf('day').toDate()
        };
        break;
      case 'week':
        dateRange = {
          $gte: now.startOf('week').toDate(),
          $lte: now.endOf('week').toDate()
        };
        break;
      case 'month':
        dateRange = {
          $gte: now.startOf('month').toDate(),
          $lte: now.endOf('month').toDate()
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateRange = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
        break;
    }

    if (Object.keys(dateRange).length > 0) {
      query.createdAt = dateRange;
    }

    // Aggregate sales data
    const analytics = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalTax: { $sum: '$taxAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          totalItems: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ]);

    // Payment method breakdown
    const paymentMethods = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Top selling products
    const topProducts = await Sale.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // Hourly sales (for today)
    let hourlySales = [];
    if (period === 'today') {
      hourlySales = await Sale.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            sales: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);
    }

    const result = {
      summary: analytics[0] || {
        totalSales: 0,
        totalRevenue: 0,
        totalTax: 0,
        averageOrderValue: 0,
        totalItems: 0
      },
      paymentMethods,
      topProducts,
      hourlySales
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSale,
  getSales,
  getSale,
  refundSale,
  getSalesAnalytics
};