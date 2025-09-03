const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Store code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]{3,10}$/, 'Store code must be 3-10 characters, uppercase letters and numbers only']
  },
  type: {
    type: String,
    enum: ['supermarket', 'convenience_store', 'hypermarket', 'wholesale'],
    default: 'supermarket',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'closed'],
    default: 'active',
    required: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State/Region is required'],
      trim: true
    },
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
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^(\+95|95|0)?[0-9]{9,10}$/, 'Please enter a valid Myanmar phone number']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    website: String
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store manager is required']
  },
  staff: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['manager', 'cashier', 'inventory_manager', 'security', 'cleaner']
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  businessHours: {
    monday: {
      open: String, // Format: "09:00"
      close: String, // Format: "21:00"
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    tuesday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    wednesday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    thursday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    friday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    saturday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    sunday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    }
  },
  settings: {
    currency: {
      type: String,
      enum: ['MMK', 'USD'],
      default: 'MMK'
    },
    language: {
      type: String,
      enum: ['en', 'my'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Asia/Yangon'
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%']
    },
    allowDiscounts: {
      type: Boolean,
      default: true
    },
    maxDiscountPercentage: {
      type: Number,
      default: 20,
      min: [0, 'Max discount cannot be negative'],
      max: [100, 'Max discount cannot exceed 100%']
    },
    requireReceipt: {
      type: Boolean,
      default: true
    },
    autoBackup: {
      type: Boolean,
      default: true
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    }
  },
  inventory: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalValue: {
      type: Number,
      default: 0
    },
    lastInventoryCheck: {
      type: Date
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    }
  },
  performance: {
    monthlySales: {
      type: Number,
      default: 0
    },
    monthlyCustomers: {
      type: Number,
      default: 0
    },
    averageTransactionValue: {
      type: Number,
      default: 0
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: [0, 'Satisfaction cannot be negative'],
      max: [5, 'Satisfaction cannot exceed 5']
    }
  },
  features: {
    hasParking: {
      type: Boolean,
      default: false
    },
    hasDelivery: {
      type: Boolean,
      default: false
    },
    hasPharmacy: {
      type: Boolean,
      default: false
    },
    hasBakery: {
      type: Boolean,
      default: false
    },
    hasFreshProduce: {
      type: Boolean,
      default: true
    },
    hasFrozenFoods: {
      type: Boolean,
      default: true
    },
    hasHousehold: {
      type: Boolean,
      default: true
    },
    hasElectronics: {
      type: Boolean,
      default: false
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
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
storeSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state}, ${addr.country}`;
});

// Virtual for business hours display
storeSchema.virtual('businessHoursDisplay').get(function() {
  const hours = this.businessHours;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return days.map(day => {
    const dayHours = hours[day];
    if (!dayHours.isOpen) return `${day.charAt(0).toUpperCase() + day.slice(1)}: Closed`;
    return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayHours.open} - ${dayHours.close}`;
  }).join(', ');
});

// Virtual for store status display
storeSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    active: '🟢 Active',
    inactive: '🔴 Inactive',
    maintenance: '🟡 Maintenance',
    closed: '⚫ Closed'
  };
  return statusMap[this.status] || this.status;
});

// Index for better query performance
storeSchema.index({ code: 1, status: 1, 'address.city': 1, 'address.state': 1 });
storeSchema.index({ manager: 1, isActive: 1 });

// Pre-save middleware to update inventory counts
storeSchema.pre('save', function(next) {
  if (this.isModified('staff')) {
    this.staff = this.staff.filter(s => s.isActive);
  }
  next();
});

// Static method to find active stores
storeSchema.statics.findActive = function() {
  return this.find({ status: 'active', isActive: true });
};

// Static method to find stores by city
storeSchema.statics.findByCity = function(city) {
  return this.find({ 'address.city': city, isActive: true });
};

// Static method to find stores by type
storeSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

// Instance method to check if store is open
storeSchema.methods.isOpen = function() {
  if (this.status !== 'active') return false;
  
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
  const dayHours = this.businessHours[day];
  if (!dayHours || !dayHours.isOpen) return false;
  
  return time >= dayHours.open && time <= dayHours.close;
};

// Instance method to get store performance summary
storeSchema.methods.getPerformanceSummary = function() {
  return {
    totalProducts: this.inventory.totalProducts,
    totalValue: this.inventory.totalValue,
    monthlySales: this.performance.monthlySales,
    monthlyCustomers: this.performance.monthlyCustomers,
    averageTransactionValue: this.performance.averageTransactionValue,
    customerSatisfaction: this.performance.customerSatisfaction
  };
};

module.exports = mongoose.model('Store', storeSchema);