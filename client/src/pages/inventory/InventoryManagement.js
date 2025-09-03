import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Tag,
  ShoppingCart,
  Star,
  ArrowUpDown,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Simulate loading inventory
    setTimeout(() => {
      setInventory([
        {
          id: 1,
          productId: 'PROD-001',
          productName: 'Organic Rice',
          productNameMyanmar: 'ဆန်အော်ဂဲနစ်',
          sku: 'PROD-001',
          category: 'grains',
          storeId: 'store-001',
          storeName: 'Yangon Central Store',
          currentStock: 150,
          minStockLevel: 20,
          maxStockLevel: 200,
          reorderPoint: 30,
          unit: 'kg',
          costPrice: 1800,
          sellingPrice: 2500,
          currency: 'MMK',
          totalValue: 270000,
          lastRestocked: '2024-01-15',
          nextRestockDate: '2024-02-15',
          supplier: 'Myanmar Rice Co.',
          supplierId: 'SUP-001',
          location: 'Aisle 3, Shelf 2',
          expiryDate: '2025-12-31',
          isExpiringSoon: false,
          daysUntilExpiry: 365,
          status: 'in_stock',
          lastAudit: '2024-01-10',
          auditStatus: 'verified',
          notes: 'Good quality organic rice, selling well',
          tags: ['organic', 'premium', 'local']
        },
        {
          id: 2,
          productId: 'PROD-002',
          productName: 'Fresh Tomatoes',
          productNameMyanmar: 'ခရမ်းချဉ်သီးလတ်လတ်',
          sku: 'PROD-002',
          category: 'vegetables',
          storeId: 'store-001',
          storeName: 'Yangon Central Store',
          currentStock: 25,
          minStockLevel: 5,
          maxStockLevel: 50,
          reorderPoint: 10,
          unit: 'kg',
          costPrice: 500,
          sellingPrice: 800,
          currency: 'MMK',
          totalValue: 12500,
          lastRestocked: '2024-01-20',
          nextRestockDate: '2024-01-25',
          supplier: 'Local Vegetable Market',
          supplierId: 'SUP-002',
          location: 'Aisle 1, Shelf 1',
          expiryDate: '2024-02-15',
          isExpiringSoon: true,
          daysUntilExpiry: 15,
          status: 'low_stock',
          lastAudit: '2024-01-18',
          auditStatus: 'verified',
          notes: 'Fresh local tomatoes, need restocking soon',
          tags: ['fresh', 'local', 'vegetables']
        },
        {
          id: 3,
          productId: 'PROD-003',
          productName: 'Chicken Breast',
          productNameMyanmar: 'ကြက်ရင်အုံသား',
          sku: 'PROD-003',
          category: 'meat',
          storeId: 'store-001',
          storeName: 'Yangon Central Store',
          currentStock: 8,
          minStockLevel: 3,
          maxStockLevel: 25,
          reorderPoint: 5,
          unit: 'kg',
          costPrice: 3200,
          sellingPrice: 4500,
          currency: 'MMK',
          totalValue: 25600,
          lastRestocked: '2024-01-18',
          nextRestockDate: '2024-01-22',
          supplier: 'Fresh Meat Co.',
          supplierId: 'SUP-003',
          location: 'Aisle 5, Shelf 3',
          expiryDate: '2024-01-25',
          isExpiringSoon: true,
          daysUntilExpiry: 3,
          status: 'low_stock',
          lastAudit: '2024-01-19',
          auditStatus: 'verified',
          notes: 'Fresh meat, need restocking before expiry',
          tags: ['fresh', 'meat', 'protein']
        },
        {
          id: 4,
          productId: 'PROD-004',
          productName: 'Cooking Oil',
          productNameMyanmar: 'ချက်ပြုတ်ဆီ',
          sku: 'PROD-004',
          category: 'cooking_essentials',
          storeId: 'store-001',
          storeName: 'Yangon Central Store',
          currentStock: 45,
          minStockLevel: 10,
          maxStockLevel: 100,
          reorderPoint: 15,
          unit: 'liter',
          costPrice: 1200,
          sellingPrice: 1800,
          currency: 'MMK',
          totalValue: 54000,
          lastRestocked: '2024-01-10',
          nextRestockDate: '2024-02-10',
          supplier: 'Golden Oil Co.',
          supplierId: 'SUP-004',
          location: 'Aisle 2, Shelf 4',
          expiryDate: '2026-06-30',
          isExpiringSoon: false,
          daysUntilExpiry: 730,
          status: 'in_stock',
          lastAudit: '2024-01-12',
          auditStatus: 'verified',
          notes: 'Stable stock, good shelf life',
          tags: ['cooking', 'essential', 'oil']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddInventory = () => {
    toast.info('Add inventory form will be implemented next');
  };

  const handleViewInventory = (item) => {
    toast.info(`View inventory: ${item.productName}`);
  };

  const handleEditInventory = (item) => {
    toast.info(`Edit inventory: ${item.productName}`);
  };

  const handleDeleteInventory = (item) => {
    toast.info(`Delete inventory: ${item.productName}`);
  };

  const handleRestock = (item) => {
    toast.info(`Restock: ${item.productName}`);
  };

  const handleAudit = (item) => {
    toast.info(`Audit: ${item.productName}`);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryText = (category) => {
    const categories = {
      grains: 'Grains & Cereals',
      vegetables: 'Fresh Vegetables',
      fruits: 'Fresh Fruits',
      meat: 'Fresh Meat',
      seafood: 'Seafood',
      dairy: 'Dairy & Eggs',
      beverages: 'Beverages',
      snacks: 'Snacks & Chips',
      canned_goods: 'Canned Goods',
      frozen_foods: 'Frozen Foods',
      cooking_essentials: 'Cooking Essentials',
      personal_care: 'Personal Care',
      household: 'Household Items',
      baby_care: 'Baby Care',
      pet_supplies: 'Pet Supplies'
    };
    return categories[category] || category;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'overstocked':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'overstocked':
        return 'Overstocked';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const getStockStatus = (item) => {
    const percentage = (item.currentStock / item.maxStockLevel) * 100;
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getExpiryStatus = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 7) return 'text-red-600';
    if (daysUntilExpiry <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getExpiryText = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 7) return 'Expiring Soon';
    if (daysUntilExpiry <= 30) return 'Expiring This Month';
    return 'Good';
  };

  const getAuditStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'discrepancy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuditStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'discrepancy':
        return 'Discrepancy';
      default:
        return status;
    }
  };

  const formatPrice = (price, currency) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const calculateStockValue = (stock, costPrice) => {
    return stock * costPrice;
  };

  const calculateStockTurnover = (currentStock, maxStock) => {
    return ((maxStock - currentStock) / maxStock * 100).toFixed(1);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalItems = inventory.length;
  const totalStockValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.status === 'low_stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'out_of_stock').length;
  const expiringSoonItems = inventory.filter(item => item.isExpiringSoon).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track stock levels, manage inventory, and monitor product movements</p>
        </div>
        
        <button
          onClick={handleAddInventory}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Inventory
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(totalStockValue, 'MMK')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-semibold text-gray-900">{expiringSoonItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleAddInventory}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Add Inventory</p>
              <p className="text-xs text-gray-500">Add new items</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Bulk restock will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Bulk Restock</p>
              <p className="text-xs text-gray-500">Restock multiple items</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Inventory audit will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Audit</p>
              <p className="text-xs text-gray-500">Verify stock levels</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Reports will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Reports</p>
              <p className="text-xs text-gray-500">Generate reports</p>
            </div>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search inventory by product name, SKU, supplier, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              <option value="grains">Grains & Cereals</option>
              <option value="vegetables">Fresh Vegetables</option>
              <option value="fruits">Fresh Fruits</option>
              <option value="meat">Fresh Meat</option>
              <option value="seafood">Seafood</option>
              <option value="dairy">Dairy & Eggs</option>
              <option value="beverages">Beverages</option>
              <option value="snacks">Snacks & Chips</option>
              <option value="canned_goods">Canned Goods</option>
              <option value="frozen_foods">Frozen Foods</option>
              <option value="cooking_essentials">Cooking Essentials</option>
              <option value="personal_care">Personal Care</option>
              <option value="household">Household Items</option>
              <option value="baby_care">Baby Care</option>
              <option value="pet_supplies">Pet Supplies</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="overstocked">Overstocked</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? "bg-primary-100 text-primary-600" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' 
                  ? "bg-primary-100 text-primary-600" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'grid' ? (
          <div className="p-6">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory found</h3>
                <p className="text-gray-600">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first inventory item'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                  <button
                    onClick={handleAddInventory}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Inventory
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.productName}</h3>
                          {item.productNameMyanmar && (
                            <p className="text-sm text-gray-600 mb-2">{item.productNameMyanmar}</p>
                          )}
                          <p className="text-sm text-gray-500 mb-2">{item.sku}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {getStatusText(item.status)}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {getCategoryText(item.category)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Store and Location */}
                      <div>
                        <p className="text-sm text-gray-600">Store & Location</p>
                        <p className="text-sm font-medium text-gray-900">{item.storeName}</p>
                        <p className="text-sm text-gray-500">{item.location}</p>
                      </div>

                      {/* Stock Information */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Current Stock</span>
                          <span className="text-sm font-medium text-gray-900">
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getStockStatus(item)}`}
                            style={{ width: `${(item.currentStock / item.maxStockLevel) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Min: {item.minStockLevel}</span>
                          <span>Max: {item.maxStockLevel}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Reorder Point: {item.reorderPoint}
                        </div>
                      </div>

                      {/* Pricing and Value */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">Cost Price</p>
                            <p className="text-sm text-gray-900">
                              {formatPrice(item.costPrice, item.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Selling Price</p>
                            <p className="text-sm text-gray-900">
                              {formatPrice(item.sellingPrice, item.currency)}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Value:</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(item.totalValue, item.currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expiry Information */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Expiry Date</span>
                          <span className={`text-sm font-medium ${getExpiryStatus(item.daysUntilExpiry)}`}>
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className={`text-sm font-medium ${getExpiryStatus(item.daysUntilExpiry)}`}>
                            {getExpiryText(item.daysUntilExpiry)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.daysUntilExpiry} days remaining
                        </div>
                      </div>

                      {/* Supplier and Restock */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Supplier</span>
                          <span className="text-sm text-gray-900">{item.supplier}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Last Restocked</span>
                          <span className="text-sm text-gray-900">
                            {new Date(item.lastRestocked).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Next Restock</span>
                          <span className="text-sm text-gray-900">
                            {new Date(item.nextRestockDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Audit Information */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Last Audit</span>
                          <span className="text-sm text-gray-900">
                            {new Date(item.lastAudit).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Audit Status</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAuditStatusColor(item.auditStatus)}`}>
                            {getAuditStatusText(item.auditStatus)}
                          </span>
                        </div>
                      </div>

                      {/* Notes */}
                      {item.notes && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="text-sm text-gray-900">{item.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Turnover: {calculateStockTurnover(item.currentStock, item.maxStockLevel)}%
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewInventory(item)}
                            className="px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditInventory(item)}
                            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleRestock(item)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Restock
                          </button>
                          <button
                            onClick={() => handleAudit(item)}
                            className="px-3 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Audit
                          </button>
                          <button
                            onClick={() => handleDeleteInventory(item)}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock & Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry & Audit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-500">{item.sku}</div>
                          {item.productNameMyanmar && (
                            <div className="text-sm text-gray-500">{item.productNameMyanmar}</div>
                          )}
                          <div className="text-sm text-gray-500">{item.storeName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCategoryText(item.category)}</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">{item.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        Min: {item.minStockLevel} | Max: {item.maxStockLevel}
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${getStockStatus(item)}`}
                          style={{ width: `${(item.currentStock / item.maxStockLevel) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-900 mt-1">
                        {formatPrice(item.totalValue, item.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getExpiryStatus(item.daysUntilExpiry)}`}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </div>
                      <div className={`text-sm ${getExpiryStatus(item.daysUntilExpiry)}`}>
                        {getExpiryText(item.daysUntilExpiry)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.daysUntilExpiry} days
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAuditStatusColor(item.auditStatus)}`}>
                          {getAuditStatusText(item.auditStatus)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.lastAudit).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewInventory(item)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                          title="View Inventory"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditInventory(item)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                          title="Edit Inventory"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRestock(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Restock"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAudit(item)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Audit"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInventory(item)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Inventory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInventory.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory found</h3>
                <p className="text-gray-600">No inventory items match your current filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;