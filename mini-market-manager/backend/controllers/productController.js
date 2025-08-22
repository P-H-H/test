const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      store,
      lowStock,
      expiringSoon
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Search by name or barcode
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // For employees, filter by their assigned store
    let storeFilter = store;
    if (req.user.role === 'employee' && req.user.assignedStore) {
      storeFilter = req.user.assignedStore._id;
    }

    const products = await Product.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter products by store inventory if store is specified
    let filteredProducts = products;
    if (storeFilter) {
      filteredProducts = products.filter(product => 
        product.inventory.some(inv => inv.store.toString() === storeFilter.toString())
      );
    }

    // Filter for low stock if requested
    if (lowStock === 'true' && storeFilter) {
      filteredProducts = filteredProducts.filter(product => {
        const storeInventory = product.inventory.find(inv => 
          inv.store.toString() === storeFilter.toString()
        );
        return storeInventory && storeInventory.quantity <= storeInventory.minStockLevel;
      });
    }

    // Filter for expiring soon if requested
    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      filteredProducts = filteredProducts.filter(product => 
        product.expiryDate && product.expiryDate <= thirtyDaysFromNow
      );
    }

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: filteredProducts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: {
        products: filteredProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName')
      .populate('inventory.store', 'name code');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // For employees, only show inventory for their assigned store
    if (req.user.role === 'employee' && req.user.assignedStore) {
      product.inventory = product.inventory.filter(inv => 
        inv.store._id.toString() === req.user.assignedStore._id.toString()
      );
    }

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user._id
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by marking as inactive
    product.isActive = false;
    product.lastModifiedBy = req.user._id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product inventory
// @route   PUT /api/products/:id/inventory
// @access  Private
const updateInventory = async (req, res, next) => {
  try {
    const { storeId, quantity, reason, movementType = 'adjustment' } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // For employees, ensure they can only update inventory for their assigned store
    if (req.user.role === 'employee') {
      if (!req.user.assignedStore || req.user.assignedStore._id.toString() !== storeId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update inventory for this store'
        });
      }
    }

    // Find existing inventory for the store
    let storeInventory = product.inventory.find(inv => inv.store.toString() === storeId.toString());
    const previousQuantity = storeInventory ? storeInventory.quantity : 0;

    if (storeInventory) {
      storeInventory.quantity = quantity;
      storeInventory.lastRestocked = new Date();
    } else {
      product.inventory.push({
        store: storeId,
        quantity: quantity,
        lastRestocked: new Date()
      });
    }

    await product.save();

    // Create stock movement record
    await StockMovement.create({
      product: product._id,
      store: storeId,
      movementType,
      quantity: quantity - previousQuantity,
      previousQuantity,
      newQuantity: quantity,
      reason: reason || 'Inventory adjustment',
      reference: {
        referenceType: 'adjustment',
        referenceId: product._id
      },
      performedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Private
const getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({ 
      barcode: req.params.barcode,
      isActive: true 
    }).populate('inventory.store', 'name code');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // For employees, only show inventory for their assigned store
    if (req.user.role === 'employee' && req.user.assignedStore) {
      product.inventory = product.inventory.filter(inv => 
        inv.store._id.toString() === req.user.assignedStore._id.toString()
      );
    }

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private
const getLowStockProducts = async (req, res, next) => {
  try {
    const { storeId } = req.query;

    // For employees, use their assigned store
    let targetStoreId = storeId;
    if (req.user.role === 'employee' && req.user.assignedStore) {
      targetStoreId = req.user.assignedStore._id;
    }

    const products = await Product.find({ isActive: true })
      .populate('inventory.store', 'name code');

    const lowStockProducts = products.filter(product => {
      const storeInventory = product.inventory.find(inv => 
        inv.store._id.toString() === targetStoreId.toString()
      );
      return storeInventory && storeInventory.quantity <= storeInventory.minStockLevel;
    });

    res.status(200).json({
      success: true,
      count: lowStockProducts.length,
      data: {
        products: lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getProductByBarcode,
  getLowStockProducts
};