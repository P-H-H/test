const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    match: [/^EMP-[0-9]{6,}$/, 'Employee ID must be in format EMP-XXXXXX']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store ID is required']
  },
  personalInfo: {
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
    firstNameMyanmar: String,
    lastNameMyanmar: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    nationalId: {
      type: String,
      trim: true,
      match: [/^[0-9]{1,2}\/[a-zA-Z]+\([A-Z]\)[0-9]{6}$/, 'Invalid Myanmar National ID format']
    },
    passportNumber: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
      address: String
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
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
      }
    }
  },
  employment: {
    position: {
      type: String,
      required: [true, 'Position is required'],
      enum: [
        'store_manager', 'assistant_manager', 'cashier', 'inventory_manager',
        'sales_associate', 'security_guard', 'cleaner', 'delivery_driver',
        'warehouse_worker', 'customer_service', 'supervisor', 'trainee'
      ]
    },
    department: {
      type: String,
      enum: [
        'management', 'sales', 'inventory', 'customer_service',
        'security', 'maintenance', 'logistics', 'administration'
      ]
    },
    hireDate: {
      type: Date,
      required: [true, 'Hire date is required']
    },
    contractType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'temporary', 'intern'],
      default: 'full_time'
    },
    salary: {
      amount: {
        type: Number,
        required: [true, 'Salary amount is required'],
        min: [0, 'Salary cannot be negative']
      },
      currency: {
        type: String,
        enum: ['MMK', 'USD'],
        default: 'MMK'
      },
      paymentFrequency: {
        type: String,
        enum: ['monthly', 'weekly', 'daily'],
        default: 'monthly'
      }
    },
    benefits: [{
      type: String,
      enum: [
        'health_insurance', 'dental_insurance', 'life_insurance',
        'retirement_plan', 'paid_time_off', 'sick_leave',
        'maternity_leave', 'transportation_allowance', 'meal_allowance',
        'performance_bonus', 'holiday_bonus', 'overtime_pay'
      ]
    }],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    subordinates: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }]
  },
  schedule: {
    workDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    shiftStart: String, // Format: "09:00"
    shiftEnd: String,   // Format: "17:00"
    breakDuration: {
      type: Number,
      default: 60, // minutes
      min: [0, 'Break duration cannot be negative']
    },
    overtimeAllowed: {
      type: Boolean,
      default: false
    },
    maxOvertimeHours: {
      type: Number,
      default: 0,
      min: [0, 'Max overtime hours cannot be negative']
    }
  },
  performance: {
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    lastReviewDate: Date,
    nextReviewDate: Date,
    goals: [{
      description: String,
      targetDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'overdue'],
        default: 'pending'
      },
      completionDate: Date
    }],
    achievements: [{
      title: String,
      description: String,
      date: Date,
      recognizedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    salesTarget: {
      monthly: Number,
      current: {
        type: Number,
        default: 0
      }
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: [0, 'Customer satisfaction cannot be negative'],
      max: [5, 'Customer satisfaction cannot exceed 5']
    }
  },
  attendance: {
    totalDaysWorked: {
      type: Number,
      default: 0
    },
    totalHoursWorked: {
      type: Number,
      default: 0
    },
    overtimeHours: {
      type: Number,
      default: 0
    },
    lateArrivals: {
      type: Number,
      default: 0
    },
    earlyDepartures: {
      type: Number,
      default: 0
    },
    absences: {
      type: Number,
      default: 0
    },
    lastAttendanceDate: Date
  },
  training: {
    completedCourses: [{
      courseName: String,
      completionDate: Date,
      certificate: String,
      score: Number
    }],
    requiredCourses: [{
      courseName: String,
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'overdue'],
        default: 'pending'
      }
    }],
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      certification: String,
      lastUpdated: Date
    }]
  },
  documents: {
    contract: String,
    idCard: String,
    taxDocuments: String,
    bankDetails: String,
    emergencyContactForm: String,
    otherDocuments: [String]
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'terminated', 'resigned', 'retired'],
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

// Virtual for full name
staffSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for full name in Myanmar
staffSchema.virtual('fullNameMyanmar').get(function() {
  if (this.personalInfo.firstNameMyanmar && this.personalInfo.lastNameMyanmar) {
    return `${this.personalInfo.firstNameMyanmar} ${this.personalInfo.lastNameMyanmar}`;
  }
  return this.fullName;
});

// Virtual for employment duration
staffSchema.virtual('employmentDuration').get(function() {
  if (!this.employment.hireDate) return 0;
  
  const now = new Date();
  const hireDate = new Date(this.employment.hireDate);
  const diffTime = Math.abs(now - hireDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Virtual for staff status display
staffSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    active: '🟢 Active',
    inactive: '🔴 Inactive',
    suspended: '🟡 Suspended',
    terminated: '⚫ Terminated',
    resigned: '🟠 Resigned',
    retired: '🟣 Retired'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for position display
staffSchema.virtual('positionDisplay').get(function() {
  const positionMap = {
    store_manager: '🏪 Store Manager',
    assistant_manager: '👔 Assistant Manager',
    cashier: '💳 Cashier',
    inventory_manager: '📦 Inventory Manager',
    sales_associate: '🛒 Sales Associate',
    security_guard: '🛡️ Security Guard',
    cleaner: '🧹 Cleaner',
    delivery_driver: '🚚 Delivery Driver',
    warehouse_worker: '🏭 Warehouse Worker',
    customer_service: '🎧 Customer Service',
    supervisor: '👨‍💼 Supervisor',
    trainee: '🎓 Trainee'
  };
  return positionMap[this.employment.position] || this.employment.position;
});

// Index for better query performance
staffSchema.index({ 
  employeeId: 1, 
  userId: 1, 
  storeId: 1, 
  'employment.position': 1, 
  status: 1 
});
staffSchema.index({ 'performance.rating': -1, 'attendance.totalDaysWorked': -1 });

// Pre-save middleware to generate employee ID
staffSchema.pre('save', function(next) {
  if (this.isNew && !this.employeeId) {
    this.generateEmployeeId();
  }
  
  // Update next review date if not set
  if (this.isNew && !this.performance.nextReviewDate) {
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + 6); // 6 months from hire
    this.performance.nextReviewDate = nextReview;
  }
  
  next();
});

// Instance method to generate employee ID
staffSchema.methods.generateEmployeeId = async function() {
  const count = await this.constructor.countDocuments();
  const dateStr = new Date().getFullYear().toString().slice(-2) + 
                  (new Date().getMonth() + 1).toString().padStart(2, '0');
  this.employeeId = `EMP-${dateStr}${(count + 1).toString().padStart(4, '0')}`;
};

// Instance method to record attendance
staffSchema.methods.recordAttendance = function(checkIn, checkOut, isLate = false, isEarly = false) {
  const today = new Date().toDateString();
  
  if (this.attendance.lastAttendanceDate && 
      new Date(this.attendance.lastAttendanceDate).toDateString() !== today) {
    
    this.attendance.totalDaysWorked += 1;
    
    if (checkIn && checkOut) {
      const workHours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
      this.attendance.totalHoursWorked += workHours;
      
      // Check for overtime
      const regularHours = 8; // Assuming 8-hour workday
      if (workHours > regularHours) {
        this.attendance.overtimeHours += (workHours - regularHours);
      }
    }
    
    if (isLate) this.attendance.lateArrivals += 1;
    if (isEarly) this.attendance.earlyDepartures += 1;
    
    this.attendance.lastAttendanceDate = new Date();
  }
  
  return this.save();
};

// Instance method to record absence
staffSchema.methods.recordAbsence = function() {
  this.attendance.absences += 1;
  return this.save();
};

// Instance method to update performance rating
staffSchema.methods.updatePerformanceRating = function(rating, reviewNotes = '') {
  this.performance.rating = rating;
  this.performance.lastReviewDate = new Date();
  
  // Set next review date (6 months from now)
  const nextReview = new Date();
  nextReview.setMonth(nextReview.getMonth() + 6);
  this.performance.nextReviewDate = nextReview;
  
  return this.save();
};

// Instance method to add achievement
staffSchema.methods.addAchievement = function(title, description, recognizedBy) {
  this.performance.achievements.push({
    title,
    description,
    date: new Date(),
    recognizedBy
  });
  
  return this.save();
};

// Static method to find staff by position
staffSchema.statics.findByPosition = function(position, storeId = null) {
  const query = { 'employment.position': position, isActive: true };
  if (storeId) query.storeId = storeId;
  
  return this.find(query);
};

// Static method to find high-performing staff
staffSchema.statics.findHighPerformers = function(minRating = 4.0, storeId = null) {
  const query = {
    'performance.rating': { $gte: minRating },
    isActive: true
  };
  if (storeId) query.storeId = storeId;
  
  return this.find(query).sort({ 'performance.rating': -1 });
};

// Static method to find staff needing review
staffSchema.statics.findNeedingReview = function(storeId = null) {
  const today = new Date();
  const query = {
    'performance.nextReviewDate': { $lte: today },
    isActive: true
  };
  if (storeId) query.storeId = storeId;
  
  return this.find(query).sort({ 'performance.nextReviewDate': 1 });
};

// Static method to get staff statistics
staffSchema.statics.getStaffStats = async function(storeId = null) {
  const matchStage = { isActive: true };
  if (storeId) matchStage.storeId = storeId;
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalStaff: { $sum: 1 },
        activeStaff: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        averageRating: { $avg: '$performance.rating' },
        totalOvertimeHours: { $sum: '$attendance.overtimeHours' },
        averageWorkDays: { $avg: '$attendance.totalDaysWorked' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalStaff: 0,
    activeStaff: 0,
    averageRating: 0,
    totalOvertimeHours: 0,
    averageWorkDays: 0
  };
};

module.exports = mongoose.model('Staff', staffSchema);