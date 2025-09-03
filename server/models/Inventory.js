const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store ID is required']
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock is required'],
    min: [0, 'Minimum stock cannot be negative'],
    default: 10
  },
  maximumStock: {
    type: Number,
    min: [0, 'Maximum stock cannot be negative']
  },
  reorderPoint: {
    type: Number,
    min: [0, 'Reorder point cannot be negative']
  },
  reorderQuantity: {
    type: Number,
    min: [1, 'Reorder quantity must be at least 1'],
    default: 50
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: [0, 'Reserved stock cannot be negative']
  },
  availableStock: {
    type: Number,
    default: 0,
    min: [0, 'Available stock cannot be negative']
  },
  stockValue: {
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative']
    },
    retail: {
      type: Number,
      default: 0,
      min: [0, 'Retail value cannot be negative']
    },
    currency: {
      type: String,
      enum: ['MMK', 'USD'],
      default: 'MMK'
    }
  },
  location: {
    warehouse: String,
    aisle: String,
    shelf: String,
    position: String,
    bin: String
  },
  supplier: {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    supplierName: String,
    supplierCode: String,
    leadTime: {
      type: Number,
      default: 7, // days
      min: [1, 'Lead time must be at least 1 day']
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: [1, 'Minimum order quantity must be at least 1']
    },
    lastOrderDate: Date,
    lastOrderQuantity: Number,
    lastOrderCost: Number
  },
  stockMovements: [{
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'transfer_in', 'transfer_out', 'damaged', 'expired', 'returned'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: Number,
    newStock: Number,
    reason: String,
    reference: String, // PO number, sale ID, etc.
    cost: Number,
    date: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  expiryTracking: {
    hasExpiry: {
      type: Boolean,
      default: false
    },
    expiryDate: Date,
    expiryWarningDays: {
      type: Number,
      default: 30,
      min: [1, 'Expiry warning days must be at least 1']
    },
    expiryStatus: {
      type: String,
      enum: ['good', 'warning', 'expired'],
      default: 'good'
    }
  },
  qualityControl: {
    lastInspectionDate: Date,
    inspectionResult: {
      type: String,
      enum: ['passed', 'failed', 'conditional'],
      default: 'passed'
    },
    inspectionNotes: String,
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    qualityIssues: [{
      issue: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      reportedDate: Date,
      resolvedDate: Date,
      status: {
        type: String,
        enum: ['open', 'investigating', 'resolved', 'closed']
      }
    }]
  },
  alerts: {
    lowStock: {
      type: Boolean,
      default: false
    },
    outOfStock: {
      type: Boolean,
      default: false
    },
    overstock: {
      type: Boolean,
      default: false
    },
    expiryWarning: {
      type: Boolean,
      default: false
    },
    qualityIssue: {
      type: Boolean,
      default: false
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastStockTake: {
    date: Date,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    variance: Number,
    notes: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= 0) return 'out_of_stock';
  if (this.currentStock <= this.minimumStock) return 'low_stock';
  if (this.maximumStock && this.currentStock >= this.maximumStock) return 'overstock';
  return 'normal';
});

// Virtual for stock status display
inventorySchema.virtual('stockStatusDisplay').get(function() {
  const statusMap = {
    out_of_stock: '🔴 Out of Stock',
    low_stock: '🟡 Low Stock',
    overstock: '🟠 Overstock',
    normal: '🟢 Normal'
  };
  return statusMap[this.stockStatus] || 'Normal';
});

// Virtual for stock level percentage
inventorySchema.virtual('stockLevelPercentage').get(function() {
  if (!this.maximumStock) return null;
  return Math.round((this.currentStock / this.maximumStock) * 100);
});

// Virtual for days until reorder
inventorySchema.virtual('daysUntilReorder').get(function() {
  if (!this.reorderPoint || this.currentStock > this.reorderPoint) return null;
  
  // Calculate based on average daily usage
  const stockMovements = this.stockMovements.filter(m => m.type === 'out');
  if (stockMovements.length === 0) return null;
  
  const totalOut = stockMovements.reduce((sum, m) => sum + m.quantity, 0);
  const daysTracked = (new Date() - new Date(this.createdAt)) / (1000 * 60 * 60 * 24);
  const averageDailyUsage = totalOut / Math.max(daysTracked, 1);
  
  if (averageDailyUsage <= 0) return null;
  
  return Math.ceil(this.currentStock / averageDailyUsage);
});

// Index for better query performance
inventorySchema.index({ 
  productId: 1, 
  storeId: 1, 
  currentStock: 1, 
  'alerts.lowStock': 1,
  'expiryTracking.expiryDate': 1
});
inventorySchema.index({ 'stockMovements.date': -1 });

// Pre-save middleware to update available stock and alerts
inventorySchema.pre('save', function(next) {
  // Calculate available stock
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  
  // Update alerts
  this.updateAlerts();
  
  // Update expiry status
  if (this.expiryTracking.hasExpiry && this.expiryTracking.expiryDate) {
    this.updateExpiryStatus();
  }
  
  // Update stock value
  this.updateStockValue();
  
  this.lastUpdated = new Date();
  next();
});

// Instance method to update alerts
inventorySchema.methods.updateAlerts = function() {
  this.alerts.lowStock = this.currentStock <= this.minimumStock;
  this.alerts.outOfStock = this.currentStock <= 0;
  this.alerts.overstock = this.maximumStock ? this.currentStock >= this.maximumStock : false;
  
  // Check for quality issues
  this.alerts.qualityIssue = this.qualityControl.qualityIssues.some(issue => 
    issue.status === 'open' || issue.status === 'investigating'
  );
};

// Instance method to update expiry status
inventorySchema.methods.updateExpiryStatus = function() {
  if (!this.expiryTracking.expiryDate) return;
  
  const today = new Date();
  const expiryDate = new Date(this.expiryTracking.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    this.expiryTracking.expiryStatus = 'expired';
    this.alerts.expiryWarning = true;
  } else if (daysUntilExpiry <= this.expiryTracking.expiryWarningDays) {
    this.expiryTracking.expiryStatus = 'warning';
    this.alerts.expiryWarning = true;
  } else {
    this.expiryTracking.expiryStatus = 'good';
    this.alerts.expiryWarning = false;
  }
};

// Instance method to update stock value
inventorySchema.methods.updateStockValue = function() {
  // This would typically get the cost from the Product model
  // For now, using a placeholder calculation
  this.stockValue.cost = this.currentStock * 100; // Assuming 100 MMK per unit
  this.stockValue.retail = this.currentStock * 150; // Assuming 150 MMK retail price
};

// Instance method to add stock movement
inventorySchema.methods.addStockMovement = function(movement) {
  const previousStock = this.currentStock;
  
  // Update stock based on movement type
  switch (movement.type) {
    case 'in':
    case 'transfer_in':
    case 'returned':
      this.currentStock += movement.quantity;
      break;
    case 'out':
    case 'transfer_out':
    case 'damaged':
    case 'expired':
      this.currentStock = Math.max(0, this.currentStock - movement.quantity);
      break;
    case 'adjustment':
      this.currentStock = Math.max(0, this.currentStock + movement.quantity);
      break;
  }
  
  // Add movement record
  movement.previousStock = previousStock;
  movement.newStock = this.currentStock;
  this.stockMovements.push(movement);
  
  // Update alerts and save
  this.updateAlerts();
  return this.save();
};

// Instance method to reserve stock
inventorySchema.methods.reserveStock = function(quantity) {
  if (this.availableStock < quantity) {
    throw new Error('Insufficient available stock');
  }
  
  this.reservedStock += quantity;
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  
  return this.save();
};

// Instance method to release reserved stock
inventorySchema.methods.releaseReservedStock = function(quantity) {
  this.reservedStock = Math.max(0, this.reservedStock - quantity);
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  
  return this.save();
};

// Instance method to check if reorder is needed
inventorySchema.methods.needsReorder = function() {
  if (!this.reorderPoint) return false;
  return this.currentStock <= this.reorderPoint;
};

// Instance method to get reorder suggestion
inventorySchema.methods.getReorderSuggestion = function() {
  if (!this.needsReorder()) return null;
  
  return {
    productId: this.productId,
    storeId: this.storeId,
    currentStock: this.currentStock,
    reorderPoint: this.reorderPoint,
    suggestedQuantity: this.reorderQuantity,
    urgency: this.currentStock === 0 ? 'critical' : 'high'
  };
};

// Static method to find low stock items
inventorySchema.statics.findLowStock = function(storeId = null) {
  const query = {
    $expr: { $lte: ['$currentStock', '$minimumStock'] },
    isActive: true
  };
  if (storeId) query.storeId = storeId;
  
  return this.find(query).populate('productId', 'name sku category');
};

// Static method to find out of stock items
inventorySchema.statics.findOutOfStock = function(storeId = null) {
  const query = { currentStock: 0, isActive: true };
  if (storeId) query.storeId = storeId;
  
  return this.find(query).populate('productId', 'name sku category');
};

// Static method to find items expiring soon
inventorySchema.statics.findExpiringSoon = function(days = 30, storeId = null) {
  const query = {
    'expiryTracking.hasExpiry': true,
    'expiryTracking.expiryDate': {
      $gte: new Date(),
      $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    },
    isActive: true
  };
  if (storeId) query.storeId = storeId;
  
  return this.find(query).populate('productId', 'name sku category');
};

// Static method to get inventory statistics
inventorySchema.statics.getInventoryStats = async function(storeId = null) {
  const matchStage = { isActive: true };
  if (storeId) matchStage.storeId = storeId;
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
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
        },
        overstockItems: {
          $sum: {
            $cond: [
              { $and: [{ $ne: ['$maximumStock', null] }, { $gte: ['$currentStock', '$maximumStock'] }] },
              1, 0
            ]
          }
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    overstockItems: 0
  };
};

module.exports = mongoose.model('Inventory', inventorySchema);