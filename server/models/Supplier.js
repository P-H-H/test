const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierCode: {
    type: String,
    required: [true, 'Supplier code is required'],
    unique: true,
    trim: true,
    match: [/^SUP-[0-9]{6,}$/, 'Supplier code must be in format SUP-XXXXXX']
  },
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [200, 'Supplier name cannot exceed 200 characters']
  },
  nameMyanmar: {
    type: String,
    trim: true,
    maxlength: [200, 'Myanmar name cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: [
      'manufacturer', 'distributor', 'wholesaler', 'importer', 'local_producer',
      'farm', 'fishery', 'bakery', 'dairy', 'meat_processor', 'beverage_producer'
    ],
    required: [true, 'Supplier type is required']
  },
  category: {
    type: String,
    enum: [
      'fresh_produce', 'dairy_eggs', 'meat_seafood', 'bakery', 'frozen_foods',
      'pantry', 'beverages', 'snacks', 'household', 'personal_care',
      'baby_care', 'pet_supplies', 'electronics', 'clothing', 'pharmacy',
      'general', 'specialty'
    ],
    required: [true, 'Supplier category is required']
  },
  contact: {
    primary: {
      name: String,
      phone: {
        type: String,
        match: [/^(\+95|95|0)?[0-9]{9,10}$/, 'Please provide a valid Myanmar phone number']
      },
      email: {
        type: String,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
      },
      position: String
    },
    secondary: {
      name: String,
      phone: String,
      email: String,
      position: String
    },
    emergency: {
      name: String,
      phone: String,
      available: String
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Myanmar'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    deliveryZone: {
      type: String,
      enum: ['local', 'regional', 'national', 'international']
    }
  },
  business: {
    registrationNumber: String,
    taxId: String,
    businessLicense: String,
    establishmentDate: Date,
    annualRevenue: {
      amount: Number,
      currency: {
        type: String,
        enum: ['MMK', 'USD'],
        default: 'MMK'
      }
    },
    employeeCount: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    },
    certifications: [{
      name: String,
      issuingBody: String,
      issueDate: Date,
      expiryDate: Date,
      status: {
        type: String,
        enum: ['active', 'expired', 'pending', 'suspended']
      }
    }],
    qualityStandards: [{
      standard: String,
      level: String,
      certified: Boolean,
      lastAudit: Date,
      nextAudit: Date
    }]
  },
  products: {
    totalProducts: {
      type: Number,
      default: 0
    },
    categories: [{
      category: String,
      productCount: Number,
      bestSellers: [String]
    }],
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order value cannot be negative']
    },
    leadTime: {
      type: Number,
      default: 7, // days
      min: [1, 'Lead time must be at least 1 day']
    },
    paymentTerms: {
      type: String,
      enum: ['cash_on_delivery', 'net_7', 'net_15', 'net_30', 'net_45', 'net_60'],
      default: 'net_30'
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: [0, 'Credit limit cannot be negative']
    },
    currentCredit: {
      type: Number,
      default: 0,
      min: [0, 'Current credit cannot be negative']
    }
  },
  performance: {
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    onTimeDelivery: {
      type: Number,
      default: 0,
      min: [0, 'On-time delivery percentage cannot be negative'],
      max: [100, 'On-time delivery percentage cannot exceed 100']
    },
    qualityScore: {
      type: Number,
      default: 0,
      min: [0, 'Quality score cannot be negative'],
      max: [5, 'Quality score cannot exceed 5']
    },
    responseTime: {
      type: Number,
      default: 0, // hours
      min: [0, 'Response time cannot be negative']
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    successfulOrders: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date,
    lastPaymentDate: Date
  },
  financial: {
    totalPurchases: {
      type: Number,
      default: 0,
      min: [0, 'Total purchases cannot be negative']
    },
    totalPayments: {
      type: Number,
      default: 0,
      min: [0, 'Total payments cannot be negative']
    },
    outstandingBalance: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    paymentHistory: [{
      amount: Number,
      date: Date,
      method: String,
      reference: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled']
      }
    }]
  },
  documents: {
    contract: String,
    priceList: String,
    catalog: String,
    certificates: [String],
    insurance: String,
    otherDocuments: [String]
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'blacklisted', 'pending_approval'],
    default: 'pending_approval'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Virtual for supplier status display
supplierSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    active: '🟢 Active',
    inactive: '🔴 Inactive',
    suspended: '🟡 Suspended',
    blacklisted: '⚫ Blacklisted',
    pending_approval: '🟠 Pending Approval'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for supplier type display
supplierSchema.virtual('typeDisplay').get(function() {
  const typeMap = {
    manufacturer: '🏭 Manufacturer',
    distributor: '🚚 Distributor',
    wholesaler: '📦 Wholesaler',
    importer: '🌍 Importer',
    local_producer: '🏡 Local Producer',
    farm: '🌾 Farm',
    fishery: '🐟 Fishery',
    bakery: '🥖 Bakery',
    dairy: '🥛 Dairy',
    meat_processor: '🥩 Meat Processor',
    beverage_producer: '🥤 Beverage Producer'
  };
  return typeMap[this.type] || this.type;
});

// Virtual for performance score
supplierSchema.virtual('performanceScore').get(function() {
  const weights = {
    rating: 0.3,
    onTimeDelivery: 0.25,
    qualityScore: 0.25,
    responseTime: 0.2
  };
  
  const responseScore = Math.max(0, 5 - (this.performance.responseTime / 24)); // Convert hours to days
  
  return (
    (this.performance.rating * weights.rating) +
    ((this.performance.onTimeDelivery / 100) * 5 * weights.onTimeDelivery) +
    (this.performance.qualityScore * weights.qualityScore) +
    (responseScore * weights.responseTime)
  );
});

// Virtual for credit utilization
supplierSchema.virtual('creditUtilization').get(function() {
  if (this.products.creditLimit === 0) return 0;
  return (this.products.currentCredit / this.products.creditLimit) * 100;
});

// Virtual for payment terms display
supplierSchema.virtual('paymentTermsDisplay').get(function() {
  const termsMap = {
    cash_on_delivery: '💵 Cash on Delivery',
    net_7: '📅 Net 7 Days',
    net_15: '📅 Net 15 Days',
    net_30: '📅 Net 30 Days',
    net_45: '📅 Net 45 Days',
    net_60: '📅 Net 60 Days'
  };
  return termsMap[this.products.paymentTerms] || this.products.paymentTerms;
});

// Index for better query performance
supplierSchema.index({ 
  supplierCode: 1, 
  name: 1, 
  type: 1, 
  category: 1, 
  status: 1 
});
supplierSchema.index({ 'performance.rating': -1, 'performance.onTimeDelivery': -1 });

// Pre-save middleware to generate supplier code
supplierSchema.pre('save', function(next) {
  if (this.isNew && !this.supplierCode) {
    this.generateSupplierCode();
  }
  
  // Calculate outstanding balance
  this.financial.outstandingBalance = this.financial.totalPurchases - this.financial.totalPayments;
  
  // Calculate average order value
  if (this.performance.totalOrders > 0) {
    this.financial.averageOrderValue = this.financial.totalPurchases / this.performance.totalOrders;
  }
  
  // Calculate success rate
  if (this.performance.totalOrders > 0) {
    this.performance.successfulOrders = this.performance.totalOrders;
  }
  
  next();
});

// Instance method to generate supplier code
supplierSchema.methods.generateSupplierCode = async function() {
  const count = await this.constructor.countDocuments();
  const dateStr = new Date().getFullYear().toString().slice(-2) + 
                  (new Date().getMonth() + 1).toString().padStart(2, '0');
  this.supplierCode = `SUP-${dateStr}${(count + 1).toString().padStart(4, '0')}`;
};

// Instance method to record order
supplierSchema.methods.recordOrder = function(orderAmount, orderDate = new Date()) {
  this.financial.totalPurchases += orderAmount;
  this.performance.totalOrders += 1;
  this.performance.lastOrderDate = orderDate;
  
  // Update average order value
  this.financial.averageOrderValue = this.financial.totalPurchases / this.performance.totalOrders;
  
  return this.save();
};

// Instance method to record payment
supplierSchema.methods.recordPayment = function(amount, method, reference) {
  this.financial.totalPayments += amount;
  this.financial.lastPaymentDate = new Date();
  
  this.financial.paymentHistory.push({
    amount,
    date: new Date(),
    method,
    reference,
    status: 'completed'
  });
  
  // Update outstanding balance
  this.financial.outstandingBalance = this.financial.totalPurchases - this.financial.totalPayments;
  
  return this.save();
};

// Instance method to update performance metrics
supplierSchema.methods.updatePerformanceMetrics = function(metrics) {
  if (metrics.rating !== undefined) {
    this.performance.rating = metrics.rating;
  }
  if (metrics.onTimeDelivery !== undefined) {
    this.performance.onTimeDelivery = metrics.onTimeDelivery;
  }
  if (metrics.qualityScore !== undefined) {
    this.performance.qualityScore = metrics.qualityScore;
  }
  if (metrics.responseTime !== undefined) {
    this.performance.responseTime = metrics.responseTime;
  }
  
  return this.save();
};

// Instance method to add certification
supplierSchema.methods.addCertification = function(certification) {
  this.business.certifications.push(certification);
  return this.save();
};

// Instance method to update quality standards
supplierSchema.methods.updateQualityStandards = function(standard, level, certified, lastAudit, nextAudit) {
  const existingStandard = this.business.qualityStandards.find(s => s.standard === standard);
  
  if (existingStandard) {
    existingStandard.level = level;
    existingStandard.certified = certified;
    existingStandard.lastAudit = lastAudit;
    existingStandard.nextAudit = nextAudit;
  } else {
    this.business.qualityStandards.push({
      standard,
      level,
      certified,
      lastAudit,
      nextAudit
    });
  }
  
  return this.save();
};

// Static method to find suppliers by category
supplierSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Static method to find high-performing suppliers
supplierSchema.statics.findHighPerformers = function(minRating = 4.0) {
  return this.find({
    'performance.rating': { $gte: minRating },
    isActive: true
  }).sort({ 'performance.rating': -1 });
};

// Static method to find suppliers by type
supplierSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to find suppliers needing review
supplierSchema.statics.findNeedingReview = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({
    $or: [
      { 'performance.lastOrderDate': { $lt: thirtyDaysAgo } },
      { 'performance.lastOrderDate': { $exists: false } }
    ],
    isActive: true
  });
};

// Static method to get supplier statistics
supplierSchema.statics.getSupplierStats = async function() {
  const pipeline = [
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalSuppliers: { $sum: 1 },
        activeSuppliers: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        averageRating: { $avg: '$performance.rating' },
        averageOnTimeDelivery: { $avg: '$performance.onTimeDelivery' },
        totalPurchases: { $sum: '$financial.totalPurchases' },
        totalOutstanding: { $sum: '$financial.outstandingBalance' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalSuppliers: 0,
    activeSuppliers: 0,
    averageRating: 0,
    averageOnTimeDelivery: 0,
    totalPurchases: 0,
    totalOutstanding: 0
  };
};

module.exports = mongoose.model('Supplier', supplierSchema);