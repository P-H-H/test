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
    uppercase: true,
    trim: true,
    maxlength: [10, 'Store code cannot exceed 10 characters']
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
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'USA'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  operatingHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '20:00' },
      closed: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    currency: {
      type: String,
      default: 'USD'
    },
    taxRate: {
      type: Number,
      default: 0.08,
      min: 0,
      max: 1
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
storeSchema.index({ code: 1 });
storeSchema.index({ isActive: 1 });
storeSchema.index({ createdBy: 1 });

// Virtual for full address
storeSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Pre-save middleware to ensure store code is uppercase
storeSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Store', storeSchema);