const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'store_manager', 'cashier', 'inventory_manager'],
    default: 'cashier',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: function() {
      return this.role !== 'super_admin';
    }
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users', 'manage_stores', 'manage_products', 'manage_inventory',
      'manage_sales', 'manage_staff', 'manage_customers', 'view_reports',
      'create_reports', 'manage_settings', 'manage_billing'
    ]
  }],
  phone: {
    type: String,
    trim: true,
    match: [/^(\+95|95|0)?[0-9]{9,10}$/, 'Please enter a valid Myanmar phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Myanmar'
    }
  },
  profileImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
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
  timezone: {
    type: String,
    default: 'Asia/Yangon'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.fullName;
});

// Index for better query performance
userSchema.index({ email: 1, username: 1, storeId: 1, role: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update passwordChangedAt
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to get user permissions
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions.includes(permission);
};

// Instance method to check if user can access store
userSchema.methods.canAccessStore = function(storeId) {
  if (this.role === 'super_admin') return true;
  return this.storeId.toString() === storeId.toString();
};

// Static method to get users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to get users by store
userSchema.statics.findByStore = function(storeId) {
  return this.find({ storeId, isActive: true });
};

module.exports = mongoose.model('User', userSchema);