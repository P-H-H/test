const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  barcode: {
    type: String,
    required: [true, 'Barcode is required'],
    unique: true,
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: [
      'Food & Beverages',
      'Personal Care',
      'Household Items',
      'Snacks & Confectionery',
      'Health & Medicine',
      'Stationery',
      'Electronics',
      'Clothing',
      'Other'
    ]
  },
  brand: {
    type: String,
    trim: true
  },
  supplier: {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    }
  },
  pricing: {
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative']
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative']
    },
    mrp: {
      type: Number,
      min: [0, 'MRP cannot be negative']
    }
  },
  inventory: [{
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, 'Minimum stock level cannot be negative']
    },
    maxStockLevel: {
      type: Number,
      default: 100,
      min: [0, 'Maximum stock level cannot be negative']
    },
    lastRestocked: {
      type: Date,
      default: Date.now
    }
  }],
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['piece', 'kg', 'gram', 'liter', 'ml', 'pack', 'box', 'bottle', 'can']
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'gram', 'liter', 'ml']
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch'],
      default: 'cm'
    }
  },
  expiryDate: {
    type: Date
  },
  manufacturingDate: {
    type: Date
  },
  batchNumber: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    alt: String
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isPerishable: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ barcode: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ 'inventory.store': 1 });
productSchema.index({ isActive: 1 });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.pricing.costPrice && this.pricing.sellingPrice) {
    return ((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.costPrice * 100).toFixed(2);
  }
  return 0;
});

// Method to get inventory for specific store
productSchema.methods.getStoreInventory = function(storeId) {
  return this.inventory.find(inv => inv.store.toString() === storeId.toString());
};

// Method to update inventory for specific store
productSchema.methods.updateStoreInventory = function(storeId, quantity) {
  const storeInventory = this.inventory.find(inv => inv.store.toString() === storeId.toString());
  if (storeInventory) {
    storeInventory.quantity = quantity;
    storeInventory.lastRestocked = new Date();
  } else {
    this.inventory.push({
      store: storeId,
      quantity: quantity,
      lastRestocked: new Date()
    });
  }
};

// Pre-save middleware
productSchema.pre('save', function(next) {
  if (this.sku) {
    this.sku = this.sku.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);