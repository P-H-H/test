const Store = require('../models/Store');
const User = require('../models/User');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Private (Owner: all stores, Employee: assigned store only)
const getStores = async (req, res, next) => {
  try {
    let query = {};

    // Employees can only see their assigned store
    if (req.user.role === 'employee' && req.user.assignedStore) {
      query._id = req.user.assignedStore._id;
    }

    const stores = await Store.find(query)
      .populate('manager', 'firstName lastName email')
      .populate('employees', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stores.length,
      data: {
        stores
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Private
const getStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('manager', 'firstName lastName email phone')
      .populate('employees', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Check if employee is trying to access a store they're not assigned to
    if (req.user.role === 'employee' && 
        (!req.user.assignedStore || req.user.assignedStore._id.toString() !== store._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this store'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        store
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new store
// @route   POST /api/stores
// @access  Private (Owner only)
const createStore = async (req, res, next) => {
  try {
    const storeData = {
      ...req.body,
      createdBy: req.user._id
    };

    const store = await Store.create(storeData);

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: {
        store
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private (Owner only)
const updateStore = async (req, res, next) => {
  try {
    let store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('manager', 'firstName lastName email')
     .populate('employees', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: {
        store
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private (Owner only)
const deleteStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Check if store has employees assigned
    const employeesCount = await User.countDocuments({ assignedStore: store._id });
    if (employeesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete store with assigned employees. Please reassign employees first.'
      });
    }

    await store.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign employee to store
// @route   PUT /api/stores/:id/assign-employee
// @access  Private (Owner only)
const assignEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (employee.role !== 'employee') {
      return res.status(400).json({
        success: false,
        message: 'User must be an employee'
      });
    }

    // Update employee's assigned store
    employee.assignedStore = store._id;
    await employee.save();

    // Add employee to store's employees array if not already present
    if (!store.employees.includes(employeeId)) {
      store.employees.push(employeeId);
      await store.save();
    }

    res.status(200).json({
      success: true,
      message: 'Employee assigned to store successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove employee from store
// @route   PUT /api/stores/:id/remove-employee
// @access  Private (Owner only)
const removeEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Remove employee's assigned store
    employee.assignedStore = undefined;
    await employee.save();

    // Remove employee from store's employees array
    store.employees = store.employees.filter(emp => emp.toString() !== employeeId);
    await store.save();

    res.status(200).json({
      success: true,
      message: 'Employee removed from store successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  assignEmployee,
  removeEmployee
};