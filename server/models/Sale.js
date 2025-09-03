const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  saleNumber: {
    type: String,
    required: [true, 'Sale number is required'],
    unique: true,
    trim: true,
    match: [/^INV-[0-9]{6,}$/, 'Sale number must be in format INV-XXXXXX']
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store ID is required']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false // Can be anonymous sale
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Staff ID is required']
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productNameMyanmar: String,
    sku: String,
    barcode: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative']
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  }],
  payment: {
    method: {
      type: String,
      enum: ['cash', 'mobile_money', 'bank_transfer', 'credit_card', 'debit_card', 'voucher'],
      required: [true, 'Payment method is required']
    },
    mobileProvider: {
      type: String,
      enum: ['kbz_pay', 'wave_money', 'mpt_money', 'cb_bank', 'aya_pay', 'other'],
      required: function() {
        return this.payment.method === 'mobile_money';
      }
    },
    bankName: String,
    cardType: String,
    referenceNumber: String,
    amountReceived: {
      type: Number,
      required: [true, 'Amount received is required'],
      min: [0, 'Amount received cannot be negative']
    },
    change: {
      type: Number,
      default: 0,
      min: [0, 'Change cannot be negative']
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative']
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    currency: {
      type: String,
      enum: ['MMK', 'USD'],
      default: 'MMK'
    }
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'completed'
  },
  saleType: {
    type: String,
    enum: ['retail', 'wholesale', 'online', 'delivery'],
    default: 'retail'
  },
  customerInfo: {
    name: String,
    phone: String,
    email: String,
    address: String,
    loyaltyCard: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  receipt: {
    printed: {
      type: Boolean,
      default: false
    },
    printedAt: Date,
    printedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    receiptNumber: String
  },
  refund: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundReason: String,
    refundedAt: Date,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  metadata: {
    deviceId: String,
    ipAddress: String,
    userAgent: String,
    sessionId: String
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

// Virtual for total items count
saleSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for profit calculation
saleSchema.virtual('estimatedProfit').get(function() {
  // This would need to be calculated based on product cost prices
  // For now, returning a placeholder
  return this.pricing.total * 0.15; // Assuming 15% profit margin
});

// Virtual for sale status display
saleSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    completed: '🟢 Completed',
    pending: '🟡 Pending',
    cancelled: '🔴 Cancelled',
    refunded: '🟠 Refunded',
    partially_refunded: '🟡 Partially Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment method display
saleSchema.virtual('paymentMethodDisplay').get(function() {
  const methodMap = {
    cash: '💵 Cash',
    mobile_money: '📱 Mobile Money',
    bank_transfer: '🏦 Bank Transfer',
    credit_card: '💳 Credit Card',
    debit_card: '💳 Debit Card',
    voucher: '🎫 Voucher'
  };
  return methodMap[this.payment.method] || this.payment.method;
});

// Index for better query performance
saleSchema.index({ 
  saleNumber: 1, 
  storeId: 1, 
  customerId: 1, 
  staffId: 1, 
  status: 1, 
  createdAt: -1 
});
saleSchema.index({ 'items.productId': 1, createdAt: -1 });

// Pre-save middleware to calculate totals
saleSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    const discountAmount = (item.unitPrice * item.quantity * item.discountPercentage) / 100;
    item.discountAmount = discountAmount;
    
    const subtotal = (item.unitPrice * item.quantity) - discountAmount;
    item.subtotal = subtotal;
    
    const taxAmount = (subtotal * item.taxRate) / 100;
    item.taxAmount = taxAmount;
    
    item.total = subtotal + taxAmount;
  });

  // Calculate sale totals
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.pricing.discountAmount = (this.pricing.subtotal * this.pricing.discountPercentage) / 100;
  this.pricing.taxAmount = (this.pricing.subtotal * this.pricing.taxRate) / 100;
  this.pricing.total = this.pricing.subtotal - this.pricing.discountAmount + this.pricing.taxAmount;

  // Calculate change
  if (this.payment.amountReceived > this.pricing.total) {
    this.payment.change = this.payment.amountReceived - this.pricing.total;
  }

  next();
});

// Static method to generate sale number
saleSchema.statics.generateSaleNumber = async function(storeId) {
  const today = new Date();
  const dateStr = today.getFullYear().toString().slice(-2) + 
                  (today.getMonth() + 1).toString().padStart(2, '0') + 
                  today.getDate().toString().padStart(2, '0');
  
  const count = await this.countDocuments({
    storeId,
    createdAt: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    }
  });
  
  return `INV-${dateStr}${(count + 1).toString().padStart(3, '0')}`;
};

// Static method to find sales by date range
saleSchema.statics.findByDateRange = function(storeId, startDate, endDate) {
  const query = {
    storeId,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    },
    isActive: true
  };
  
  return this.find(query).populate('customerId', 'name phone email');
};

// Static method to find sales by customer
saleSchema.statics.findByCustomer = function(customerId, storeId = null) {
  const query = { customerId, isActive: true };
  if (storeId) query.storeId = storeId;
  
  return this.find(query).populate('storeId', 'name code');
};

// Static method to get sales statistics
saleSchema.statics.getSalesStats = async function(storeId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        storeId: mongoose.Types.ObjectId(storeId),
        createdAt: { $gte: startDate, $lte: endDate },
        isActive: true,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$pricing.total' },
        totalTransactions: { $sum: 1 },
        averageTransactionValue: { $avg: '$pricing.total' },
        totalItems: { $sum: '$totalItems' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalSales: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    totalItems: 0
  };
};

// Instance method to calculate refund
saleSchema.methods.calculateRefund = function(refundAmount, reason) {
  if (refundAmount > this.pricing.total) {
    throw new Error('Refund amount cannot exceed sale total');
  }
  
  this.refund.isRefunded = true;
  this.refund.refundAmount = refundAmount;
  this.refund.refundReason = reason;
  this.refund.refundedAt = new Date();
  
  if (refundAmount === this.pricing.total) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  return this.save();
};

module.exports = mongoose.model('Sale', saleSchema);