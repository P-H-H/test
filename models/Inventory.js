const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    min: 0,
    default: 0
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  reorderLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  location: {
    aisle: String,
    shelf: String,
    notes: String
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure one inventory record per product per store
inventorySchema.index({ store: 1, product: 1 }, { unique: true });

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'Out of Stock';
  if (this.quantity <= this.reorderLevel) return 'Low Stock';
  return 'In Stock';
});

module.exports = mongoose.model('Inventory', inventorySchema);