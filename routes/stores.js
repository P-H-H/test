const express = require('express');
const { body, validationResult } = require('express-validator');
const Store = require('../models/Store');
const User = require('../models/User');
const { protect, ownerOnly, ownerOrManager } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all stores
// @route   GET /api/stores
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let stores;
    
    if (req.user.role === 'owner') {
      stores = await Store.find({ owner: req.user._id })
        .populate('manager', 'name email')
        .populate('employees', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Employee can only see assigned stores
      stores = await Store.find({ 
        _id: { $in: req.user.assignedStores },
        isActive: true 
      })
        .populate('manager', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('manager', 'name email phone')
      .populate('employees', 'name email phone')
      .populate('owner', 'name email');

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check access permissions
    if (req.user.role === 'employee' && 
        !req.user.assignedStores.includes(store._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'owner' && 
        store.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new store
// @route   POST /api/stores
// @access  Private (Owner only)
router.post('/', protect, ownerOnly, [
  body('name').trim().notEmpty().withMessage('Store name is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('Zip code is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      address,
      phone,
      email,
      managerId,
      openingHours
    } = req.body;

    // Check if manager exists and is an employee
    let manager = null;
    if (managerId) {
      manager = await User.findById(managerId);
      if (!manager || manager.role !== 'employee') {
        return res.status(400).json({ message: 'Invalid manager selection' });
      }
    }

    const store = await Store.create({
      name,
      address,
      phone,
      email,
      manager: managerId || null,
      openingHours,
      owner: req.user._id
    });

    // Add manager to assignedStores if specified
    if (manager) {
      manager.assignedStores.push(store._id);
      await manager.save();
    }

    const populatedStore = await Store.findById(store._id)
      .populate('manager', 'name email')
      .populate('owner', 'name email');

    res.status(201).json(populatedStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private (Owner only)
router.put('/:id', protect, ownerOnly, [
  body('name').optional().trim().notEmpty().withMessage('Store name cannot be empty'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check ownership
    if (store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { managerId } = req.body;

    // Handle manager change
    if (managerId !== undefined) {
      // Remove store from old manager
      if (store.manager) {
        const oldManager = await User.findById(store.manager);
        if (oldManager) {
          oldManager.assignedStores = oldManager.assignedStores.filter(
            storeId => storeId.toString() !== store._id.toString()
          );
          await oldManager.save();
        }
      }

      // Add store to new manager
      if (managerId) {
        const newManager = await User.findById(managerId);
        if (!newManager || newManager.role !== 'employee') {
          return res.status(400).json({ message: 'Invalid manager selection' });
        }
        if (!newManager.assignedStores.includes(store._id)) {
          newManager.assignedStores.push(store._id);
          await newManager.save();
        }
      }
    }

    store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('manager', 'name email')
      .populate('employees', 'name email')
      .populate('owner', 'name email');

    res.json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private (Owner only)
router.delete('/:id', protect, ownerOnly, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check ownership
    if (store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove store from all assigned employees
    await User.updateMany(
      { assignedStores: store._id },
      { $pull: { assignedStores: store._id } }
    );

    await store.deleteOne();

    res.json({ message: 'Store removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add employee to store
// @route   POST /api/stores/:id/employees
// @access  Private (Owner only)
router.post('/:id/employees', protect, ownerOnly, [
  body('employeeId').notEmpty().withMessage('Employee ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check ownership
    if (store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const employee = await User.findById(req.body.employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(400).json({ message: 'Employee not found' });
    }

    // Add employee to store
    if (!store.employees.includes(employee._id)) {
      store.employees.push(employee._id);
      await store.save();
    }

    // Add store to employee's assigned stores
    if (!employee.assignedStores.includes(store._id)) {
      employee.assignedStores.push(store._id);
      await employee.save();
    }

    const updatedStore = await Store.findById(store._id)
      .populate('employees', 'name email');

    res.json(updatedStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Remove employee from store
// @route   DELETE /api/stores/:id/employees/:employeeId
// @access  Private (Owner only)
router.delete('/:id/employees/:employeeId', protect, ownerOnly, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check ownership
    if (store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove employee from store
    store.employees = store.employees.filter(
      emp => emp.toString() !== req.params.employeeId
    );
    await store.save();

    // Remove store from employee's assigned stores
    await User.findByIdAndUpdate(
      req.params.employeeId,
      { $pull: { assignedStores: store._id } }
    );

    const updatedStore = await Store.findById(store._id)
      .populate('employees', 'name email');

    res.json(updatedStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;