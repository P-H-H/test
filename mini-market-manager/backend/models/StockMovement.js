const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  movementType: {
    type: String,
    required: true,
    enum: ['in', 'out', 'adjustment', 'transfer', 'damaged', 'expired', 'return']
  },
  quantity: {
    type: Number,
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true,
    min: [0, 'Previous quantity cannot be negative']
  },
  newQuantity: {
    type: Number,
    required: true,
    min: [0, 'New quantity cannot be negative']
  },
  unitCost: {
    type: Number,
    min: [0, 'Unit cost cannot be negative']
  },
  totalCost: {
    type: Number,
    min: [0, 'Total cost cannot be negative']
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  },
  reference: {
    referenceType: {
      type: String,
      enum: ['sale', 'purchase', 'adjustment', 'transfer', 'return'],
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  supplier: {
    type: String,
    trim: true
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
stockMovementSchema.index({ product: 1, store: 1, createdAt: -1 });
stockMovementSchema.index({ store: 1, createdAt: -1 });
stockMovementSchema.index({ movementType: 1, createdAt: -1 });
stockMovementSchema.index({ performedBy: 1, createdAt: -1 });
stockMovementSchema.index({ 'reference.referenceType': 1, 'reference.referenceId': 1 });

// Pre-save middleware to calculate total cost
stockMovementSchema.pre('save', function(next) {
  if (this.unitCost && this.quantity) {
    this.totalCost = Math.abs(this.quantity) * this.unitCost;
  }
  next();
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);