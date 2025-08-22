const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Store = require('../models/Store');
const { protect, ownerOnly, generateToken } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all employees (Owner only)
// @route   GET /api/users/employees
// @access  Private (Owner only)
router.get('/employees', protect, ownerOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    let query = { 
      role: 'employee',
      createdBy: req.user._id
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      query.isActive = status === 'active';
    }

    const employees = await User.find(query)
      .select('-password')
      .populate('assignedStores', 'name address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single employee
// @route   GET /api/users/employees/:id
// @access  Private (Owner only)
router.get('/employees/:id', protect, ownerOnly, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .select('-password')
      .populate('assignedStores', 'name address phone')
      .populate('createdBy', 'name email');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.role !== 'employee' || 
        employee.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new employee
// @route   POST /api/users/employees
// @access  Private (Owner only)
router.post('/employees', protect, ownerOnly, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, assignedStores = [] } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate assigned stores belong to the owner
    if (assignedStores.length > 0) {
      const stores = await Store.find({ 
        _id: { $in: assignedStores },
        owner: req.user._id 
      });
      
      if (stores.length !== assignedStores.length) {
        return res.status(400).json({ message: 'Invalid store assignments' });
      }
    }

    // Create employee
    const employee = await User.create({
      name,
      email,
      password,
      phone,
      role: 'employee',
      assignedStores,
      createdBy: req.user._id
    });

    // Add employee to assigned stores
    if (assignedStores.length > 0) {
      await Store.updateMany(
        { _id: { $in: assignedStores } },
        { $addToSet: { employees: employee._id } }
      );
    }

    const populatedEmployee = await User.findById(employee._id)
      .select('-password')
      .populate('assignedStores', 'name address');

    res.status(201).json(populatedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update employee
// @route   PUT /api/users/employees/:id
// @access  Private (Owner only)
router.put('/employees/:id', protect, ownerOnly, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.role !== 'employee' || 
        employee.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, phone, assignedStores, isActive } = req.body;

    // Check if email already exists (if updating email)
    if (email && email !== employee.email) {
      const emailExists = await User.findOne({ 
        email, 
        _id: { $ne: employee._id } 
      });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Handle store assignments
    if (assignedStores !== undefined) {
      // Validate assigned stores belong to the owner
      if (assignedStores.length > 0) {
        const stores = await Store.find({ 
          _id: { $in: assignedStores },
          owner: req.user._id 
        });
        
        if (stores.length !== assignedStores.length) {
          return res.status(400).json({ message: 'Invalid store assignments' });
        }
      }

      // Remove employee from old stores
      await Store.updateMany(
        { employees: employee._id },
        { $pull: { employees: employee._id } }
      );

      // Add employee to new stores
      if (assignedStores.length > 0) {
        await Store.updateMany(
          { _id: { $in: assignedStores } },
          { $addToSet: { employees: employee._id } }
        );
      }

      employee.assignedStores = assignedStores;
    }

    // Update other fields
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (phone) employee.phone = phone;
    if (isActive !== undefined) employee.isActive = isActive;

    await employee.save();

    const updatedEmployee = await User.findById(employee._id)
      .select('-password')
      .populate('assignedStores', 'name address');

    res.json(updatedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete employee
// @route   DELETE /api/users/employees/:id
// @access  Private (Owner only)
router.delete('/employees/:id', protect, ownerOnly, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.role !== 'employee' || 
        employee.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove employee from all stores
    await Store.updateMany(
      { employees: employee._id },
      { $pull: { employees: employee._id } }
    );

    // Remove as manager from any stores
    await Store.updateMany(
      { manager: employee._id },
      { $unset: { manager: 1 } }
    );

    // Soft delete - deactivate instead of hard delete to preserve sales history
    employee.isActive = false;
    employee.email = `deleted_${Date.now()}_${employee.email}`;
    await employee.save();

    res.json({ message: 'Employee deactivated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Reset employee password
// @route   PUT /api/users/employees/:id/reset-password
// @access  Private (Owner only)
router.put('/employees/:id/reset-password', protect, ownerOnly, [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.role !== 'employee' || 
        employee.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    employee.password = req.body.newPassword;
    await employee.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get dashboard stats for owner
// @route   GET /api/users/dashboard-stats
// @access  Private (Owner only)
router.get('/dashboard-stats', protect, ownerOnly, async (req, res) => {
  try {
    const totalStores = await Store.countDocuments({ 
      owner: req.user._id, 
      isActive: true 
    });

    const totalEmployees = await User.countDocuments({ 
      createdBy: req.user._id, 
      role: 'employee',
      isActive: true 
    });

    const activeEmployees = await User.countDocuments({ 
      createdBy: req.user._id, 
      role: 'employee',
      isActive: true 
    });

    const inactiveEmployees = await User.countDocuments({ 
      createdBy: req.user._id, 
      role: 'employee',
      isActive: false 
    });

    // Get recent employees
    const recentEmployees = await User.find({ 
      createdBy: req.user._id, 
      role: 'employee' 
    })
      .select('name email phone isActive createdAt')
      .populate('assignedStores', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalStores,
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      recentEmployees
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;