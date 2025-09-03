const express = require('express');
const { query, param, validationResult } = require('express-validator');
const { protect, authorize, checkPermission, checkStoreAccess } = require('../middleware/auth');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const Inventory = require('../models/Inventory');
const Store = require('../models/Store');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Get dashboard overview
router.get('/dashboard/overview', [
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
    } else if (!checkPermission(req.user, 'view_all_reports')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    // Get sales statistics
    const salesStats = await Sale.getSalesStats(query.storeId, start, end);
    
    // Get customer statistics
    const customerStats = await Customer.getCustomerStats();
    
    // Get staff statistics
    const staffStats = await Staff.getStaffStats(storeId);
    
    // Get inventory statistics
    const inventoryStats = await Inventory.getInventoryStats(storeId);

    // Calculate growth percentages (mock data for now)
    const growthData = {
      sales: 15.2,
      customers: 8.7,
      products: 12.3,
      revenue: 18.9
    };

    res.json({
      success: true,
      data: {
        period: { start, end },
        sales: {
          total: salesStats.totalSales,
          transactions: salesStats.totalTransactions,
          averageOrder: salesStats.averageTransactionValue,
          growth: growthData.sales
        },
        customers: {
          total: customerStats.totalCustomers,
          active: customerStats.activeCustomers,
          loyaltyPoints: customerStats.totalLoyaltyPoints,
          growth: growthData.customers
        },
        staff: {
          total: staffStats.totalStaff,
          active: staffStats.activeStaff,
          averageRating: staffStats.averageRating,
          overtimeHours: staffStats.totalOvertimeHours
        },
        inventory: {
          products: inventoryStats.totalProducts,
          stockValue: inventoryStats.totalValue,
          lowStock: inventoryStats.lowStockItems,
          outOfStock: inventoryStats.outOfStockItems
        },
        growth: growthData
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get sales performance report
router.get('/sales/performance', [
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
    } else if (!checkPermission(req.user, 'view_all_reports')) {
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
          averageOrderValue: { $avg: '$pricing.total' },
          uniqueCustomers: { $addToSet: '$customerId' }
        }
      },
      {
        $addFields: {
          uniqueCustomerCount: { $size: '$uniqueCustomers' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const results = await Sale.aggregate(pipeline);

    res.json({
      success: true,
      data: {
        period: { start: startDate, end: endDate },
        groupBy,
        results
      }
    });
  } catch (error) {
    console.error('Error fetching sales performance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get top performing products
router.get('/products/top-performing', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('metric').optional().isIn(['quantity', 'revenue', 'profit']).withMessage('Valid metric is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, startDate, endDate, limit = 10, metric = 'quantity' } = req.query;

    // Build query
    const query = {
      createdAt: { 
        $gte: new Date(startDate || new Date().setDate(new Date().getDate() - 30)), 
        $lte: new Date(endDate || new Date()) 
      },
      isActive: true,
      status: 'completed'
    };

    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_reports')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          productNameMyanmar: { $first: '$items.productNameMyanmar' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          averagePrice: { $avg: '$items.unitPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: metric === 'quantity' ? { totalQuantity: -1 } : { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ];

    const results = await Sale.aggregate(pipeline);

    res.json({
      success: true,
      data: {
        period: { 
          start: startDate || new Date(new Date().setDate(new Date().getDate() - 30)), 
          end: endDate || new Date() 
        },
        metric,
        results
      }
    });
  } catch (error) {
    console.error('Error fetching top performing products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer insights report
router.get('/customers/insights', [
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
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 365));
    const end = endDate ? new Date(endDate) : new Date();

    // Build query
    const query = { isActive: true };
    
    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query['storePreferences.primaryStore'] = storeId;
    } else if (!checkPermission(req.user, 'view_all_reports')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query['storePreferences.primaryStore'] = userStoreId;
      }
    }

    // Get customer statistics
    const customerStats = await Customer.getCustomerStats();

    // Get customers by loyalty tier
    const loyaltyPipeline = [
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

    const loyaltyResults = await Customer.aggregate(loyaltyPipeline);

    // Get high-value customers
    const highValueCustomers = await Customer.findHighValueCustomers(100000, storeId)
      .limit(10)
      .select('name loyalty.tier purchaseHistory.totalSpent purchaseHistory.lastPurchaseDate');

    res.json({
      success: true,
      data: {
        period: { start, end },
        overview: customerStats,
        loyaltyBreakdown: loyaltyResults,
        highValueCustomers
      }
    });
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get inventory health report
router.get('/inventory/health', [
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
    } else if (!checkPermission(req.user, 'view_all_reports')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    // Get inventory statistics
    const inventoryStats = await Inventory.getInventoryStats(storeId);

    // Get low stock items
    const lowStockItems = await Inventory.findLowStock(storeId);

    // Get out of stock items
    const outOfStockItems = await Inventory.findOutOfStock(storeId);

    // Get items expiring soon
    const expiringItems = await Inventory.findExpiringSoon(30, storeId);

    // Get reorder suggestions
    const reorderSuggestions = await Inventory.find(query)
      .populate('productId', 'name sku category')
      .populate('storeId', 'name code');

    const suggestions = reorderSuggestions
      .map(item => item.getReorderSuggestion())
      .filter(suggestion => suggestion !== null);

    res.json({
      success: true,
      data: {
        overview: inventoryStats,
        alerts: {
          lowStock: lowStockItems.length,
          outOfStock: outOfStockItems.length,
          expiringSoon: expiringItems.length
        },
        lowStockItems,
        outOfStockItems,
        expiringItems,
        reorderSuggestions: suggestions
      }
    });
  } catch (error) {
    console.error('Error fetching inventory health:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get staff performance report
router.get('/staff/performance', [
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
    const query = { isActive: true };
    
    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_reports')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    // Get staff statistics
    const staffStats = await Staff.getStaffStats(storeId);

    // Get staff by position
    const positionPipeline = [
      { $match: query },
      {
        $group: {
          _id: '$employment.position',
          count: { $sum: 1 },
          averageRating: { $avg: '$performance.rating' },
          averageWorkDays: { $avg: '$attendance.totalDaysWorked' },
          totalOvertimeHours: { $sum: '$attendance.overtimeHours' }
        }
      },
      { $sort: { count: -1 } }
    ];

    const positionResults = await Staff.aggregate(positionPipeline);

    // Get high-performing staff
    const highPerformers = await Staff.findHighPerformers(4.0, storeId)
      .limit(10)
      .populate('storeId', 'name code')
      .populate('userId', 'username email');

    // Get staff needing review
    const staffNeedingReview = await Staff.findNeedingReview(storeId)
      .populate('storeId', 'name code')
      .populate('userId', 'username email');

    res.json({
      success: true,
      data: {
        period: { start, end },
        overview: staffStats,
        byPosition: positionResults,
        highPerformers,
        staffNeedingReview
      }
    });
  } catch (error) {
    console.error('Error fetching staff performance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get store comparison report
router.get('/stores/comparison', [
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required'),
  query('metrics').optional().isArray().withMessage('Metrics must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, metrics = ['sales', 'customers', 'staff', 'inventory'] } = req.query;

    // Check permissions
    if (!checkPermission(req.user, 'view_all_reports')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all stores
    const stores = await Store.find({ isActive: true }).select('name code address');

    const comparisonData = [];

    for (const store of stores) {
      const storeData = {
        store: {
          id: store._id,
          name: store.name,
          code: store.code,
          address: store.address
        }
      };

      // Get sales data for this store
      if (metrics.includes('sales')) {
        const salesStats = await Sale.getSalesStats(store._id, start, end);
        storeData.sales = salesStats;
      }

      // Get customer data for this store
      if (metrics.includes('customers')) {
        const customerQuery = { 'storePreferences.primaryStore': store._id, isActive: true };
        const customerStats = await Customer.getCustomerStats();
        storeData.customers = customerStats;
      }

      // Get staff data for this store
      if (metrics.includes('staff')) {
        const staffStats = await Staff.getStaffStats(store._id);
        storeData.staff = staffStats;
      }

      // Get inventory data for this store
      if (metrics.includes('inventory')) {
        const inventoryStats = await Inventory.getInventoryStats(store._id);
        storeData.inventory = inventoryStats;
      }

      comparisonData.push(storeData);
    }

    res.json({
      success: true,
      data: {
        period: { start, end },
        metrics,
        stores: comparisonData
      }
    });
  } catch (error) {
    console.error('Error fetching store comparison:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Myanmar market insights
router.get('/market/myanmar-insights', [
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
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 90));
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
    } else if (!checkPermission(req.user, 'view_all_reports')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    // Get payment method analysis
    const paymentPipeline = [
      { $match: query },
      {
        $group: {
          _id: '$payment.method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' },
          averageAmount: { $avg: '$pricing.total' }
        }
      },
      { $sort: { count: -1 } }
    ];

    const paymentResults = await Sale.aggregate(paymentPipeline);

    // Get mobile money provider analysis
    const mobileMoneyPipeline = [
      { $match: { ...query, 'payment.method': 'mobile_money' } },
      {
        $group: {
          _id: '$payment.mobileProvider',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' }
        }
      },
      { $sort: { count: -1 } }
    ];

    const mobileMoneyResults = await Sale.aggregate(mobileMoneyPipeline);

    // Get seasonal trends (by month)
    const seasonalPipeline = [
      { $match: query },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalSales: { $sum: '$pricing.total' },
          totalTransactions: { $sum: 1 },
          averageOrderValue: { $avg: '$pricing.total' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const seasonalResults = await Sale.aggregate(seasonalPipeline);

    // Mock data for Myanmar-specific insights
    const myanmarInsights = {
      localProducts: {
        totalSales: 12500000, // 12.5M MMK
        growth: 23.5,
        topCategories: ['fresh_produce', 'dairy_eggs', 'meat_seafood']
      },
      culturalPreferences: {
        peakHours: ['09:00-11:00', '17:00-19:00'],
        popularDays: ['Friday', 'Saturday', 'Sunday'],
        seasonalTrends: ['Water Festival', 'Thingyan', 'Christmas']
      },
      marketConditions: {
        inflationImpact: 8.2,
        currencyStability: 'stable',
        localCompetition: 'moderate'
      }
    };

    res.json({
      success: true,
      data: {
        period: { start, end },
        paymentMethods: paymentResults,
        mobileMoneyProviders: mobileMoneyResults,
        seasonalTrends: seasonalResults,
        myanmarInsights
      }
    });
  } catch (error) {
    console.error('Error fetching Myanmar market insights:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export report data
router.get('/export/:type', [
  param('type').isIn(['sales', 'customers', 'inventory', 'staff', 'suppliers']).withMessage('Valid report type is required'),
  query('format').isIn(['csv', 'json', 'pdf']).withMessage('Valid export format is required'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, format, startDate, endDate, storeId } = req.query;

    // Check permissions
    if (!checkPermission(req.user, 'export_reports')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // For now, return a message indicating export functionality
    // In a real implementation, you would generate and return the actual file
    res.json({
      success: true,
      message: `Export functionality for ${type} report in ${format} format is being implemented`,
      data: {
        type,
        format,
        period: { start: startDate, end: endDate },
        storeId
      }
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;