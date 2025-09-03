const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { protect, authorize, checkPermission, checkStoreAccess } = require('../middleware/auth');
const Staff = require('../models/Staff');
const User = require('../models/User');
const Store = require('../models/Store');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Validation middleware
const validateStaff = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('storeId').isMongoId().withMessage('Valid store ID is required'),
  body('personalInfo.firstName').isString().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('personalInfo.lastName').isString().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('personalInfo.firstNameMyanmar').optional().isString().trim().isLength({ max: 50 }).withMessage('Myanmar first name cannot exceed 50 characters'),
  body('personalInfo.lastNameMyanmar').optional().isString().trim().isLength({ max: 50 }).withMessage('Myanmar last name cannot exceed 50 characters'),
  body('contact.phone').matches(/^(\+95|95|0)?[0-9]{9,10}$/).withMessage('Please provide a valid Myanmar phone number'),
  body('contact.email').optional().isEmail().withMessage('Please provide a valid email'),
  body('employment.position').isIn([
    'store_manager', 'assistant_manager', 'cashier', 'inventory_manager',
    'sales_associate', 'security_guard', 'cleaner', 'delivery_driver',
    'warehouse_worker', 'customer_service', 'supervisor', 'trainee'
  ]).withMessage('Valid position is required'),
  body('employment.department').optional().isIn([
    'management', 'sales', 'inventory', 'customer_service',
    'security', 'maintenance', 'logistics', 'administration'
  ]).withMessage('Valid department is required'),
  body('employment.hireDate').isISO8601().withMessage('Valid hire date is required'),
  body('employment.contractType').optional().isIn(['full_time', 'part_time', 'contract', 'temporary', 'intern']).withMessage('Valid contract type is required'),
  body('employment.salary.amount').isFloat({ min: 0 }).withMessage('Salary amount must be positive'),
  body('employment.salary.currency').optional().isIn(['MMK', 'USD']).withMessage('Currency must be MMK or USD'),
  body('employment.salary.paymentFrequency').optional().isIn(['monthly', 'weekly', 'daily']).withMessage('Valid payment frequency is required'),
  body('schedule.workDays').optional().isArray().withMessage('Work days must be an array'),
  body('schedule.workDays.*').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).withMessage('Valid work day is required'),
  body('schedule.shiftStart').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Shift start must be in HH:MM format'),
  body('schedule.shiftEnd').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Shift end must be in HH:MM format'),
  body('schedule.breakDuration').optional().isInt({ min: 0, max: 480 }).withMessage('Break duration must be between 0 and 480 minutes')
];

const validateStaffUpdate = [
  body('personalInfo.firstName').optional().isString().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('contact.phone').optional().matches(/^(\+95|95|0)?[0-9]{9,10}$/).withMessage('Please provide a valid Myanmar phone number'),
  body('employment.position').optional().isIn([
    'store_manager', 'assistant_manager', 'cashier', 'inventory_manager',
    'sales_associate', 'security_guard', 'cleaner', 'delivery_driver',
    'warehouse_worker', 'customer_service', 'supervisor', 'trainee'
  ]).withMessage('Valid position is required'),
  body('status').optional().isIn(['active', 'inactive', 'suspended', 'terminated', 'resigned', 'retired']).withMessage('Valid status is required')
];

// Get all staff with filtering and pagination
router.get('/', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('position').optional().isIn([
    'store_manager', 'assistant_manager', 'cashier', 'inventory_manager',
    'sales_associate', 'security_guard', 'cleaner', 'delivery_driver',
    'warehouse_worker', 'customer_service', 'supervisor', 'trainee'
  ]).withMessage('Valid position is required'),
  query('department').optional().isIn([
    'management', 'sales', 'inventory', 'customer_service',
    'security', 'maintenance', 'logistics', 'administration'
  ]).withMessage('Valid department is required'),
  query('status').optional().isIn(['active', 'inactive', 'suspended', 'terminated', 'resigned', 'retired']).withMessage('Valid status is required'),
  query('search').optional().isString().trim().isLength({ min: 2 }).withMessage('Search term must be at least 2 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['personalInfo.firstName', 'employment.position', 'performance.rating', 'employment.hireDate']).withMessage('Valid sort field is required'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      storeId,
      position,
      department,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'employment.hireDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_staff')) {
      // If no store specified and user can't view all staff, restrict to their store
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    if (position) query['employment.position'] = position;
    if (department) query['employment.department'] = department;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.firstNameMyanmar': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastNameMyanmar': { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const staff = await Staff.find(query)
      .populate('storeId', 'name code')
      .populate('userId', 'username email')
      .populate('employment.supervisor', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Staff.countDocuments(query);

    res.json({
      success: true,
      data: staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single staff member by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Valid staff ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const staff = await Staff.findById(req.params.id)
      .populate('storeId', 'name code address')
      .populate('userId', 'username email profileImage')
      .populate('employment.supervisor', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('employment.subordinates', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, staff.storeId)) {
      return res.status(403).json({ message: 'Access denied to this staff member' });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new staff member
router.post('/', [
  ...validateStaff
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      userId,
      storeId,
      personalInfo,
      contact,
      employment,
      schedule,
      notes
    } = req.body;

    // Check store access
    if (!checkStoreAccess(req.user, storeId)) {
      return res.status(403).json({ message: 'Access denied to specified store' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_staff')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Check if user already has a staff record
    const existingStaff = await Staff.findOne({ userId, isActive: true });
    if (existingStaff) {
      return res.status(400).json({ message: 'User already has a staff record' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Create staff member
    const staff = new Staff({
      userId,
      storeId,
      personalInfo,
      contact,
      employment: {
        ...employment,
        salary: {
          amount: employment.salary.amount,
          currency: employment.salary.currency || 'MMK',
          paymentFrequency: employment.salary.paymentFrequency || 'monthly'
        }
      },
      schedule: {
        workDays: schedule?.workDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        shiftStart: schedule?.shiftStart || '09:00',
        shiftEnd: schedule?.shiftEnd || '17:00',
        breakDuration: schedule?.breakDuration || 60,
        overtimeAllowed: schedule?.overtimeAllowed || false,
        maxOvertimeHours: schedule?.maxOvertimeHours || 0
      },
      notes,
      createdBy: req.user._id
    });

    await staff.save();

    // Update user with store assignment
    user.storeId = storeId;
    await user.save();

    // Populate references for response
    await staff.populate([
      { path: 'storeId', select: 'name code' },
      { path: 'userId', select: 'username email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staff
    });
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update staff member
router.put('/:id', [
  param('id').isMongoId().withMessage('Valid staff ID is required'),
  ...validateStaffUpdate
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, staff.storeId)) {
      return res.status(403).json({ message: 'Access denied to this staff member' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_staff')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'personalInfo', 'contact', 'employment', 'schedule', 'notes', 'status', 'tags'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        staff[field] = req.body[field];
      }
    });

    staff.updatedBy = req.user._id;
    await staff.save();

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete staff member (soft delete)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Valid staff ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, staff.storeId)) {
      return res.status(403).json({ message: 'Access denied to this staff member' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_staff')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Soft delete
    staff.isActive = false;
    staff.status = 'terminated';
    staff.updatedBy = req.user._id;
    await staff.save();

    // Remove store assignment from user
    await User.findByIdAndUpdate(staff.userId, { $unset: { storeId: 1 } });

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Record attendance
router.post('/:id/attendance', [
  param('id').isMongoId().withMessage('Valid staff ID is required'),
  body('checkIn').isISO8601().withMessage('Valid check-in time is required'),
  body('checkOut').optional().isISO8601().withMessage('Valid check-out time is required'),
  body('isLate').optional().isBoolean().withMessage('Is late must be a boolean'),
  body('isEarly').optional().isBoolean().withMessage('Is early must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { checkIn, checkOut, isLate = false, isEarly = false } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, staff.storeId)) {
      return res.status(403).json({ message: 'Access denied to this staff member' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_staff')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Record attendance
    await staff.recordAttendance(checkIn, checkOut, isLate, isEarly);

    res.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: {
        totalDaysWorked: staff.attendance.totalDaysWorked,
        totalHoursWorked: staff.attendance.totalHoursWorked,
        overtimeHours: staff.attendance.overtimeHours,
        lateArrivals: staff.attendance.lateArrivals,
        earlyDepartures: staff.attendance.earlyDepartures
      }
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update performance rating
router.post('/:id/performance/rating', [
  param('id').isMongoId().withMessage('Valid staff ID is required'),
  body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('reviewNotes').optional().isString().trim().isLength({ max: 1000 }).withMessage('Review notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, reviewNotes = '' } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, staff.storeId)) {
      return res.status(403).json({ message: 'Access denied to this staff member' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_staff')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update performance rating
    await staff.updatePerformanceRating(rating, reviewNotes);

    res.json({
      success: true,
      message: 'Performance rating updated successfully',
      data: {
        rating: staff.performance.rating,
        lastReviewDate: staff.performance.lastReviewDate,
        nextReviewDate: staff.performance.nextReviewDate
      }
    });
  } catch (error) {
    console.error('Error updating performance rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add achievement
router.post('/:id/performance/achievement', [
  param('id').isMongoId().withMessage('Valid staff ID is required'),
  body('title').isString().trim().notEmpty().withMessage('Achievement title is required'),
  body('description').isString().trim().notEmpty().withMessage('Achievement description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check store access
    if (!checkStoreAccess(req.user, staff.storeId)) {
      return res.status(403).json({ message: 'Access denied to this staff member' });
    }

    // Check permissions
    if (!checkPermission(req.user, 'manage_staff')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Add achievement
    await staff.addAchievement(title, description, req.user._id);

    res.json({
      success: true,
      message: 'Achievement added successfully',
      data: {
        achievements: staff.performance.achievements
      }
    });
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get staff statistics
router.get('/stats/overview', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_staff')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    // Get staff statistics
    const stats = await Staff.getStaffStats(storeId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching staff statistics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get staff by position
router.get('/stats/by-position', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (storeId) {
      if (!checkStoreAccess(req.user, storeId)) {
        return res.status(403).json({ message: 'Access denied to this store' });
      }
      query.storeId = storeId;
    } else if (!checkPermission(req.user, 'view_all_staff')) {
      const userStoreId = req.user.storeId;
      if (userStoreId) {
        query.storeId = userStoreId;
      }
    }

    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: '$employment.position',
          count: { $sum: 1 },
          averageRating: { $avg: '$performance.rating' },
          averageWorkDays: { $avg: '$attendance.totalDaysWorked' },
          totalOvertimeHours: { $sum: '$attendance.overtimeHours' }
        }
      },
      { $sort: { count: -1 } }
    ];

    const results = await Staff.aggregate(pipeline);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching staff by position:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get high-performing staff
router.get('/stats/high-performers', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Minimum rating must be between 0 and 5'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, minRating = 4.0, limit = 10 } = req.query;

    // Check store access
    if (storeId && !checkStoreAccess(req.user, storeId)) {
      return res.status(403).json({ message: 'Access denied to this store' });
    }

    // Get high-performing staff
    const highPerformers = await Staff.findHighPerformers(parseFloat(minRating), storeId)
      .populate('storeId', 'name code')
      .populate('userId', 'username email')
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: highPerformers
    });
  } catch (error) {
    console.error('Error fetching high performers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get staff needing review
router.get('/stats/needing-review', [
  query('storeId').optional().isMongoId().withMessage('Valid store ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId } = req.query;

    // Check store access
    if (storeId && !checkStoreAccess(req.user, storeId)) {
      return res.status(403).json({ message: 'Access denied to this store' });
    }

    // Get staff needing review
    const staffNeedingReview = await Staff.findNeedingReview(storeId)
      .populate('storeId', 'name code')
      .populate('userId', 'username email');

    res.json({
      success: true,
      data: staffNeedingReview
    });
  } catch (error) {
    console.error('Error fetching staff needing review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;