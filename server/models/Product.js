const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  nameMyanmar: {
    type: String,
    trim: true,
    maxlength: [200, 'Myanmar product name cannot exceed 200 characters']
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^[0-9]{8,13}$/, 'Barcode must be 8-13 digits']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]{3,20}$/, 'SKU must be 3-20 characters, uppercase letters and numbers only']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'fresh_produce', 'dairy_eggs', 'meat_seafood', 'bakery', 'frozen_foods',
      'pantry', 'beverages', 'snacks', 'household', 'personal_care',
      'baby_care', 'pet_supplies', 'electronics', 'clothing', 'pharmacy',
      'alcohol', 'tobacco', 'gift_cards', 'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  descriptionMyanmar: {
    type: String,
    trim: true,
    maxlength: [1000, 'Myanmar description cannot exceed 1000 characters']
  },
  specifications: {
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['g', 'kg', 'ml', 'l', 'pcs', 'units'],
        default: 'pcs'
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
    expiryDate: Date,
    manufacturedDate: Date,
    countryOfOrigin: String,
    ingredients: [String],
    allergens: [String],
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbohydrates: Number,
      fat: Number,
      fiber: Number,
      sugar: Number,
      sodium: Number
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
    wholesalePrice: {
      type: Number,
      min: [0, 'Wholesale price cannot be negative']
    },
    currency: {
      type: String,
      enum: ['MMK', 'USD'],
      default: 'MMK'
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%']
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    discountValidUntil: Date
  },
  inventory: {
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
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    location: {
      aisle: String,
      shelf: String,
      position: String
    },
    lastStockUpdate: {
      type: Date,
      default: Date.now
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'out_of_stock'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isSeasonal: {
    type: Boolean,
    default: false
  },
  seasonalStart: Date,
  seasonalEnd: Date,
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store ID is required']
  },
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

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.pricing.sellingPrice <= 0 || this.pricing.costPrice <= 0) return 0;
  return ((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.sellingPrice) * 100;
});

// Virtual for profit amount
productSchema.virtual('profitAmount').get(function() {
  return this.pricing.sellingPrice - this.pricing.costPrice;
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.pricing.discountPercentage <= 0) return this.pricing.sellingPrice;
  return this.pricing.sellingPrice * (1 - this.pricing.discountPercentage / 100);
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.inventory.currentStock <= 0) return 'out_of_stock';
  if (this.inventory.currentStock <= this.inventory.minimumStock) return 'low_stock';
  if (this.inventory.maximumStock && this.inventory.currentStock >= this.inventory.maximumStock) return 'overstocked';
  return 'normal';
});

// Virtual for stock status display
productSchema.virtual('stockStatusDisplay').get(function() {
  const statusMap = {
    out_of_stock: '🔴 Out of Stock',
    low_stock: '🟡 Low Stock',
    overstocked: '🟠 Overstocked',
    normal: '🟢 Normal'
  };
  return statusMap[this.stockStatus] || 'Normal';
});

// Virtual for price with tax
productSchema.virtual('priceWithTax').get(function() {
  const basePrice = this.discountedPrice;
  return basePrice * (1 + this.pricing.taxRate / 100);
});

// Index for better query performance
productSchema.index({ 
  sku: 1, 
  barcode: 1, 
  name: 'text', 
  nameMyanmar: 'text',
  category: 1, 
  brand: 1, 
  storeId: 1, 
  status: 1 
});

// Text index for search functionality
productSchema.index({ 
  name: 'text', 
  nameMyanmar: 'text', 
  description: 'text', 
  descriptionMyanmar: 'text',
  brand: 'text',
  tags: 'text'
});

// Pre-save middleware to update stock status
productSchema.pre('save', function(next) {
  if (this.isModified('inventory.currentStock')) {
    this.inventory.lastStockUpdate = new Date();
  }
  
  // Set primary image if none exists
  if (this.images.length > 0 && !this.images.some(img => img.isPrimary)) {
    this.images[0].isPrimary = true;
  }
  
  next();
});

// Static method to find products by category
productSchema.statics.findByCategory = function(category, storeId) {
  const query = { category, isActive: true };
  if (storeId) query.storeId = storeId;
  return this.find(query);
};

// Static method to find low stock products
productSchema.statics.findLowStock = function(storeId) {
  const query = {
    'inventory.currentStock': { $lte: '$inventory.minimumStock' },
    isActive: true
  };
  if (storeId) query.storeId = storeId;
  return this.find(query);
};

// Static method to find out of stock products
productSchema.statics.findOutOfStock = function(storeId) {
  const query = {
    'inventory.currentStock': 0,
    isActive: true
  };
  if (storeId) query.storeId = storeId;
  return this.find(query);
};

// Static method to search products
productSchema.statics.search = function(searchTerm, storeId) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true
  };
  if (storeId) query.storeId = storeId;
  return this.find(query, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
};

// Instance method to update stock
productSchema.methods.updateStock = function(quantity, type = 'add') {
  if (type === 'add') {
    this.inventory.currentStock += quantity;
  } else if (type === 'subtract') {
    this.inventory.currentStock = Math.max(0, this.inventory.currentStock - quantity);
  } else if (type === 'set') {
    this.inventory.currentStock = Math.max(0, quantity);
  }
  
  this.inventory.lastStockUpdate = new Date();
  return this.save();
};

// Instance method to check if product needs reordering
productSchema.methods.needsReorder = function() {
  return this.inventory.currentStock <= this.inventory.reorderPoint;
};

module.exports = mongoose.model('Product', productSchema);