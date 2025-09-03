const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerNumber: {
    type: String,
    required: [true, 'Customer number is required'],
    unique: true,
    trim: true,
    match: [/^CUST-[0-9]{6,}$/, 'Customer number must be in format CUST-XXXXXX']
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  nameMyanmar: {
    type: String,
    trim: true,
    maxlength: [100, 'Myanmar name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(\+95|95|0)?[0-9]{9,10}$/, 'Please provide a valid Myanmar phone number']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
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
    }
  },
  personalInfo: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    occupation: String,
    company: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  loyalty: {
    cardNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    points: {
      type: Number,
      default: 0,
      min: [0, 'Points cannot be negative']
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    joinDate: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, 'Total spent cannot be negative']
    },
    lifetimePoints: {
      type: Number,
      default: 0,
      min: [0, 'Lifetime points cannot be negative']
    }
  },
  preferences: {
    language: {
      type: String,
      enum: ['en', 'my'],
      default: 'en'
    },
    currency: {
      type: String,
      enum: ['MMK', 'USD'],
      default: 'MMK'
    },
    communication: {
      sms: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    },
    marketing: {
      type: Boolean,
      default: true
    },
    categories: [{
      type: String,
      enum: [
        'fresh_produce', 'dairy_eggs', 'meat_seafood', 'bakery', 'frozen_foods',
        'pantry', 'beverages', 'snacks', 'household', 'personal_care',
        'baby_care', 'pet_supplies', 'electronics', 'clothing', 'pharmacy'
      ]
    }],
    dietaryRestrictions: [{
      type: String,
      enum: [
        'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free',
        'halal', 'kosher', 'low_sodium', 'low_sugar', 'organic_only'
      ]
    }]
  },
  purchaseHistory: {
    totalPurchases: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    lastPurchaseDate: Date,
    favoriteProducts: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      purchaseCount: {
        type: Number,
        default: 1
      }
    }],
    favoriteCategories: [{
      category: String,
      purchaseCount: {
        type: Number,
        default: 0
      }
    }]
  },
  storePreferences: {
    primaryStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store'
    },
    preferredStores: [{
      storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
      },
      visitCount: {
        type: Number,
        default: 0
      },
      lastVisit: Date
    }],
    preferredShoppingTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night', 'anytime']
    },
    preferredShoppingDay: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'anyday']
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deceased'],
    default: 'active'
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

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  if (!this.address.street) return '';
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state}, ${addr.country}`;
});

// Virtual for customer status display
customerSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    active: '🟢 Active',
    inactive: '🔴 Inactive',
    suspended: '🟡 Suspended',
    deceased: '⚫ Deceased'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for loyalty tier display
customerSchema.virtual('tierDisplay').get(function() {
  const tierMap = {
    bronze: '🥉 Bronze',
    silver: '🥈 Silver',
    gold: '🥇 Gold',
    platinum: '💎 Platinum',
    diamond: '💎 Diamond'
  };
  return tierMap[this.loyalty.tier] || this.loyalty.tier;
});

// Virtual for customer value
customerSchema.virtual('customerValue').get(function() {
  if (this.purchaseHistory.totalPurchases === 0) return 'New Customer';
  
  const avgOrder = this.purchaseHistory.averageOrderValue;
  if (avgOrder < 10000) return 'Low Value';
  if (avgOrder < 50000) return 'Medium Value';
  if (avgOrder < 100000) return 'High Value';
  return 'Premium Customer';
});

// Index for better query performance
customerSchema.index({ 
  customerNumber: 1, 
  phone: 1, 
  email: 1, 
  'loyalty.cardNumber': 1, 
  status: 1 
});
customerSchema.index({ 'loyalty.tier': 1, 'purchaseHistory.totalPurchases': -1 });

// Pre-save middleware to generate customer number
customerSchema.pre('save', function(next) {
  if (this.isNew && !this.customerNumber) {
    this.generateCustomerNumber();
  }
  
  // Update last activity
  if (this.isModified('loyalty.points') || this.isModified('purchaseHistory.totalPurchases')) {
    this.loyalty.lastActivity = new Date();
  }
  
  next();
});

// Instance method to generate customer number
customerSchema.methods.generateCustomerNumber = async function() {
  const count = await this.constructor.countDocuments();
  const dateStr = new Date().getFullYear().toString().slice(-2) + 
                  (new Date().getMonth() + 1).toString().padStart(2, '0');
  this.customerNumber = `CUST-${dateStr}${(count + 1).toString().padStart(4, '0')}`;
};

// Instance method to add loyalty points
customerSchema.methods.addPoints = function(points, reason = 'Purchase') {
  this.loyalty.points += points;
  this.loyalty.lifetimePoints += points;
  this.loyalty.lastActivity = new Date();
  
  // Update tier based on points
  this.updateTier();
  
  return this.save();
};

// Instance method to update loyalty tier
customerSchema.methods.updateTier = function() {
  const points = this.loyalty.points;
  
  if (points >= 10000) {
    this.loyalty.tier = 'diamond';
  } else if (points >= 5000) {
    this.loyalty.tier = 'platinum';
  } else if (points >= 2000) {
    this.loyalty.tier = 'gold';
  } else if (points >= 500) {
    this.loyalty.tier = 'silver';
  } else {
    this.loyalty.tier = 'bronze';
  }
};

// Instance method to record purchase
customerSchema.methods.recordPurchase = function(amount, productIds = []) {
  this.purchaseHistory.totalPurchases += 1;
  this.purchaseHistory.totalSpent += amount;
  this.purchaseHistory.averageOrderValue = this.purchaseHistory.totalSpent / this.purchaseHistory.totalPurchases;
  this.purchaseHistory.lastPurchaseDate = new Date();
  
  // Update favorite products
  productIds.forEach(productId => {
    const existingProduct = this.purchaseHistory.favoriteProducts.find(p => p.productId.equals(productId));
    if (existingProduct) {
      existingProduct.purchaseCount += 1;
    } else {
      this.purchaseHistory.favoriteProducts.push({
        productId,
        purchaseCount: 1
      });
    }
  });
  
  // Sort favorite products by purchase count
  this.purchaseHistory.favoriteProducts.sort((a, b) => b.purchaseCount - a.purchaseCount);
  
  return this.save();
};

// Static method to find customers by tier
customerSchema.statics.findByTier = function(tier) {
  return this.find({ 'loyalty.tier': tier, isActive: true });
};

// Static method to find high-value customers
customerSchema.statics.findHighValueCustomers = function(minAmount = 100000) {
  return this.find({
    'purchaseHistory.totalSpent': { $gte: minAmount },
    isActive: true
  }).sort({ 'purchaseHistory.totalSpent': -1 });
};

// Static method to find inactive customers
customerSchema.statics.findInactiveCustomers = function(daysInactive = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
  
  return this.find({
    'loyalty.lastActivity': { $lt: cutoffDate },
    isActive: true
  });
};

// Static method to get customer statistics
customerSchema.statics.getCustomerStats = async function() {
  const pipeline = [
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        activeCustomers: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        totalLoyaltyPoints: { $sum: '$loyalty.points' },
        averageSpending: { $avg: '$purchaseHistory.totalSpent' },
        totalRevenue: { $sum: '$purchaseHistory.totalSpent' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalCustomers: 0,
    activeCustomers: 0,
    totalLoyaltyPoints: 0,
    averageSpending: 0,
    totalRevenue: 0
  };
};

module.exports = mongoose.model('Customer', customerSchema);