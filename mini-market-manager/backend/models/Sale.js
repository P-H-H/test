const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  barcode: {
    type: String,
    required: true
  },
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
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  }
});

const saleSchema = new mongoose.Schema({
  saleNumber: {
    type: String,
    required: true,
    unique: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: [0, 'Total discount cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [1, 'Tax rate cannot exceed 100%']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'card', 'digital_wallet', 'bank_transfer', 'other']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  customer: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  receiptPrinted: {
    type: Boolean,
    default: false
  },
  refunded: {
    type: Boolean,
    default: false
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: [0, 'Refund amount cannot be negative']
  },
  refundReason: {
    type: String,
    trim: true
  },
  refundDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
saleSchema.index({ saleNumber: 1 });
saleSchema.index({ store: 1, createdAt: -1 });
saleSchema.index({ employee: 1, createdAt: -1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ createdAt: -1 });

// Generate sale number
saleSchema.pre('save', async function(next) {
  if (!this.saleNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count sales for today
    const startOfDay = new Date(year, date.getMonth(), date.getDate());
    const endOfDay = new Date(year, date.getMonth(), date.getDate() + 1);
    
    const todaySalesCount = await this.constructor.countDocuments({
      store: this.store,
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const sequence = String(todaySalesCount + 1).padStart(4, '0');
    this.saleNumber = `${year}${month}${day}-${sequence}`;
  }
  next();
});

// Calculate totals before saving
saleSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
  
  // Calculate total discount
  this.totalDiscount = this.items.reduce((total, item) => total + item.discount, 0);
  
  // Calculate tax amount
  this.taxAmount = (this.subtotal - this.totalDiscount) * this.taxRate;
  
  // Calculate total amount
  this.totalAmount = this.subtotal - this.totalDiscount + this.taxAmount;
  
  next();
});

// Virtual for profit calculation
saleSchema.virtual('profit').get(function() {
  return this.items.reduce((total, item) => {
    // This would need to be calculated with actual cost price from product
    // For now, assuming a basic calculation
    return total + (item.totalPrice * 0.2); // Assuming 20% profit margin
  }, 0);
});

module.exports = mongoose.model('Sale', saleSchema);