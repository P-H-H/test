const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Food & Beverages',
      'Personal Care',
      'Household Items',
      'Snacks & Confectionery',
      'Dairy Products',
      'Frozen Foods',
      'Health & Medicine',
      'Stationery',
      'Electronics',
      'Other'
    ]
  },
  brand: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Please add a unit'],
    enum: ['piece', 'kg', 'liter', 'pack', 'bottle', 'can', 'box']
  },
  costPrice: {
    type: Number,
    required: [true, 'Please add cost price'],
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Please add selling price'],
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate profit margin
productSchema.virtual('profitMargin').get(function() {
  return ((this.sellingPrice - this.costPrice) / this.costPrice * 100).toFixed(2);
});

module.exports = mongoose.model('Product', productSchema);