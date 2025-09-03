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
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Simulate loading products
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          sku: 'PROD-001',
          name: 'Organic Rice',
          nameMyanmar: 'ဆန်အော်ဂဲနစ်',
          category: 'grains',
          subcategory: 'rice',
          brand: 'Myanmar Organic',
          description: 'Premium organic rice from Myanmar highlands',
          descriptionMyanmar: 'မြန်မာပြည်ကုန်းမြင့်ဒေသမှ ပရီမီယံ အော်ဂဲနစ်ဆန်',
          price: 2500,
          costPrice: 1800,
          currency: 'MMK',
          unit: 'kg',
          stockQuantity: 150,
          minStockLevel: 20,
          maxStockLevel: 200,
          reorderPoint: 30,
          supplier: 'Myanmar Rice Co.',
          supplierId: 'SUP-001',
          barcode: '1234567890123',
          weight: 1.0,
          dimensions: { length: 20, width: 15, height: 5 },
          isActive: true,
          isFeatured: true,
          tags: ['organic', 'premium', 'local'],
          images: ['rice1.jpg', 'rice2.jpg'],
          rating: 4.8,
          reviewCount: 45,
          lastRestocked: '2024-01-15',
          expiryDate: '2025-12-31',
          location: 'Aisle 3, Shelf 2',
          storeId: 'store-001',
          storeName: 'Yangon Central Store'
        },
        {
          id: 2,
          sku: 'PROD-002',
          name: 'Fresh Tomatoes',
          nameMyanmar: 'ခရမ်းချဉ်သီးလတ်လတ်',
          category: 'vegetables',
          subcategory: 'tomatoes',
          brand: 'Local Farm',
          description: 'Fresh red tomatoes from local farms',
          descriptionMyanmar: 'ဒေသခံလယ်ယာများမှ ခရမ်းချဉ်သီးလတ်လတ်',
          price: 800,
          costPrice: 500,
          currency: 'MMK',
          unit: 'kg',
          stockQuantity: 25,
          minStockLevel: 5,
          maxStockLevel: 50,
          reorderPoint: 10,
          supplier: 'Local Vegetable Market',
          supplierId: 'SUP-002',
          barcode: '1234567890124',
          weight: 0.5,
          dimensions: { length: 8, width: 6, height: 3 },
          isActive: true,
          isFeatured: false,
          tags: ['fresh', 'local', 'vegetables'],
          images: ['tomato1.jpg'],
          rating: 4.5,
          reviewCount: 32,
          lastRestocked: '2024-01-20',
          expiryDate: '2024-02-15',
          location: 'Aisle 1, Shelf 1',
          storeId: 'store-001',
          storeName: 'Yangon Central Store'
        },
        {
          id: 3,
          sku: 'PROD-003',
          name: 'Chicken Breast',
          nameMyanmar: 'ကြက်ရင်အုံသား',
          category: 'meat',
          subcategory: 'chicken',
          brand: 'Fresh Meat Co.',
          description: 'Fresh chicken breast, boneless and skinless',
          descriptionMyanmar: 'ကြက်ရင်အုံသား အတုံးလိုက် အနှစ်မပါ',
          price: 4500,
          costPrice: 3200,
          currency: 'MMK',
          unit: 'kg',
          stockQuantity: 8,
          minStockLevel: 3,
          maxStockLevel: 25,
          reorderPoint: 5,
          supplier: 'Fresh Meat Co.',
          supplierId: 'SUP-003',
          barcode: '1234567890125',
          weight: 0.3,
          dimensions: { length: 15, width: 10, height: 2 },
          isActive: true,
          isFeatured: true,
          tags: ['fresh', 'meat', 'protein'],
          images: ['chicken1.jpg', 'chicken2.jpg'],
          rating: 4.7,
          reviewCount: 28,
          lastRestocked: '2024-01-18',
          expiryDate: '2024-01-25',
          location: 'Aisle 5, Shelf 3',
          storeId: 'store-001',
          storeName: 'Yangon Central Store'
        },
        {
          id: 4,
          sku: 'PROD-004',
          name: 'Cooking Oil',
          nameMyanmar: 'ချက်ပြုတ်ဆီ',
          category: 'cooking_essentials',
          subcategory: 'oil',
          brand: 'Golden Oil',
          description: 'Pure cooking oil for all your cooking needs',
          descriptionMyanmar: 'ချက်ပြုတ်ရန်အတွက် ဆီစစ်စစ်',
          price: 1800,
          costPrice: 1200,
          currency: 'MMK',
          unit: 'liter',
          stockQuantity: 45,
          minStockLevel: 10,
          maxStockLevel: 100,
          reorderPoint: 15,
          supplier: 'Golden Oil Co.',
          supplierId: 'SUP-004',
          barcode: '1234567890126',
          weight: 1.0,
          dimensions: { length: 12, width: 8, height: 8 },
          isActive: true,
          isFeatured: false,
          tags: ['cooking', 'essential', 'oil'],
          images: ['oil1.jpg'],
          rating: 4.3,
          reviewCount: 67,
          lastRestocked: '2024-01-10',
          expiryDate: '2026-06-30',
          location: 'Aisle 2, Shelf 4',
          storeId: 'store-001',
          storeName: 'Yangon Central Store'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddProduct = () => {
    toast.info('Add product form will be implemented next');
  };

  const handleViewProduct = (product) => {
    toast.info(`View product: ${product.name}`);
  };

  const handleEditProduct = (product) => {
    toast.info(`Edit product: ${product.name}`);
  };

  const handleDeleteProduct = (product) => {
    toast.info(`Delete product: ${product.name}`);
  };

  const handleRestock = (product) => {
    toast.info(`Restock product: ${product.name}`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive) ||
                         (statusFilter === 'low_stock' && product.stockQuantity <= product.minStockLevel) ||
                         (statusFilter === 'out_of_stock' && product.stockQuantity === 0);
    
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

  const getStatusColor = (product) => {
    if (!product.isActive) return 'bg-gray-100 text-gray-800';
    if (product.stockQuantity === 0) return 'bg-red-100 text-red-800';
    if (product.stockQuantity <= product.minStockLevel) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (product) => {
    if (!product.isActive) return 'Inactive';
    if (product.stockQuantity === 0) return 'Out of Stock';
    if (product.stockQuantity <= product.minStockLevel) return 'Low Stock';
    return 'In Stock';
  };

  const getStockStatus = (product) => {
    const percentage = (product.stockQuantity / product.maxStockLevel) * 100;
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPrice = (price, currency) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const calculateProfit = (product) => {
    return product.price - product.costPrice;
  };

  const calculateProfitMargin = (product) => {
    return ((product.price - product.costPrice) / product.price * 100).toFixed(1);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.isActive && p.stockQuantity <= p.minStockLevel).length;
  const outOfStockProducts = products.filter(p => p.isActive && p.stockQuantity === 0).length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your product catalog, inventory, and pricing</p>
        </div>
        
        <button
          onClick={handleAddProduct}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
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
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-semibold text-gray-900">{activeProducts}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{lowStockProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(totalStockValue, 'MMK')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleAddProduct}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Add Product</p>
              <p className="text-xs text-gray-500">Create new product</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Bulk import will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Bulk Import</p>
              <p className="text-xs text-gray-500">Import multiple products</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Inventory audit will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Inventory Audit</p>
              <p className="text-xs text-gray-500">Check stock levels</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Price updates will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Price Updates</p>
              <p className="text-xs text-gray-500">Update product prices</p>
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
                placeholder="Search products by name, SKU, brand, or description..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
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

      {/* Products List */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'grid' ? (
          <div className="p-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first product'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                  <button
                    onClick={handleAddProduct}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                          {product.nameMyanmar && (
                            <p className="text-sm text-gray-600 mb-2">{product.nameMyanmar}</p>
                          )}
                          <p className="text-sm text-gray-500 mb-2">{product.sku}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product)}`}>
                              {getStatusText(product)}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {getCategoryText(product.category)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Brand and Description */}
                      <div>
                        <p className="text-sm text-gray-600">Brand</p>
                        <p className="text-sm font-medium text-gray-900">{product.brand}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                      </div>

                      {/* Pricing */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-600">Selling Price</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice(product.price, product.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cost Price</p>
                          <p className="text-sm text-gray-900">
                            {formatPrice(product.costPrice, product.currency)}
                          </p>
                        </div>
                      </div>

                      {/* Profit */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Profit:</span>
                          <span className="text-sm font-medium text-green-600">
                            {formatPrice(calculateProfit(product), product.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Margin:</span>
                          <span className="text-sm font-medium text-green-600">
                            {calculateProfitMargin(product)}%
                          </span>
                        </div>
                      </div>

                      {/* Stock Information */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Stock Level</span>
                          <span className="text-sm font-medium text-gray-900">
                            {product.stockQuantity} {product.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getStockStatus(product)}`}
                            style={{ width: `${(product.stockQuantity / product.maxStockLevel) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Min: {product.minStockLevel}</span>
                          <span>Max: {product.maxStockLevel}</span>
                        </div>
                      </div>

                      {/* Rating and Reviews */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-medium ${getRatingColor(product.rating)}`}>
                              {product.rating}
                            </span>
                            <Star className={`w-4 h-4 ${getRatingColor(product.rating)}`} />
                          </div>
                          <span className="text-sm text-gray-500">
                            {product.reviewCount} reviews
                          </span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <span>Supplier: {product.supplier}</span>
                          <span>Location: {product.location}</span>
                          <span>Last Restocked: {new Date(product.lastRestocked).toLocaleDateString()}</span>
                          <span>Expires: {new Date(product.expiryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Store: {product.storeName}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleRestock(product)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Restock
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
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
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price & Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                          {product.nameMyanmar && (
                            <div className="text-sm text-gray-500">{product.nameMyanmar}</div>
                          )}
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCategoryText(product.category)}</div>
                      <div className="text-sm text-gray-500">{product.subcategory}</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product)}`}>
                        {getStatusText(product)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price, product.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cost: {formatPrice(product.costPrice, product.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Stock: {product.stockQuantity} {product.unit}
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${getStockStatus(product)}`}
                          style={{ width: `${(product.stockQuantity / product.maxStockLevel) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-medium ${getRatingColor(product.rating)}`}>
                          {product.rating}
                        </span>
                        <Star className={`w-4 h-4 ${getRatingColor(product.rating)}`} />
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.reviewCount} reviews
                      </div>
                      <div className="text-sm text-green-600">
                        {calculateProfitMargin(product)}% margin
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                          title="View Product"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRestock(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Restock Product"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">No products match your current filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;