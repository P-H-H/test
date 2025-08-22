import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../Layout/Layout';
import { 
  Package, 
  Plus, 
  Edit, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  X,
  BarChart3,
  RefreshCw,
  Archive,
  ShoppingCart
} from 'lucide-react';

const InventoryManagement = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    adjustment: '',
    reason: ''
  });
  const [addInventoryData, setAddInventoryData] = useState({
    productId: '',
    quantity: '',
    reorderLevel: '',
    location: {
      aisle: '',
      shelf: '',
      notes: ''
    }
  });

  const queryClient = useQueryClient();

  // Fetch store info
  const { data: store } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      const response = await axios.get(`/api/stores/${storeId}`);
      return response.data;
    },
  });

  // Fetch inventory
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', storeId, searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await axios.get(`/api/inventory/${storeId}?${params}`);
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch available products
  const { data: productsData } = useQuery({
    queryKey: ['products-for-inventory'],
    queryFn: async () => {
      const response = await axios.get('/api/products?limit=100');
      return response.data;
    },
  });

  // Fetch inventory summary
  const { data: summary } = useQuery({
    queryKey: ['inventory-summary', storeId],
    queryFn: async () => {
      const response = await axios.get(`/api/inventory/summary/${storeId}`);
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Add inventory mutation
  const addInventoryMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post('/api/inventory', {
        storeId,
        ...data
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory', storeId]);
      queryClient.invalidateQueries(['inventory-summary', storeId]);
      toast.success('Inventory item added successfully!');
      setIsAddModalOpen(false);
      resetAddForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add inventory item');
    },
  });

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await axios.put(`/api/inventory/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory', storeId]);
      queryClient.invalidateQueries(['inventory-summary', storeId]);
      toast.success('Inventory updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update inventory');
    },
  });

  // Adjust inventory mutation
  const adjustInventoryMutation = useMutation({
    mutationFn: async ({ id, adjustment, reason }) => {
      const response = await axios.put(`/api/inventory/${id}/adjust`, {
        adjustment: parseFloat(adjustment),
        reason
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory', storeId]);
      queryClient.invalidateQueries(['inventory-summary', storeId]);
      toast.success('Inventory adjusted successfully!');
      setIsAdjustModalOpen(false);
      setSelectedItem(null);
      setAdjustmentData({ adjustment: '', reason: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to adjust inventory');
    },
  });

  const resetAddForm = () => {
    setAddInventoryData({
      productId: '',
      quantity: '',
      reorderLevel: '',
      location: {
        aisle: '',
        shelf: '',
        notes: ''
      }
    });
  };

  const handleAddInventory = (e) => {
    e.preventDefault();
    addInventoryMutation.mutate({
      productId: addInventoryData.productId,
      quantity: parseInt(addInventoryData.quantity),
      reorderLevel: parseInt(addInventoryData.reorderLevel),
      location: addInventoryData.location
    });
  };

  const handleAdjustInventory = (e) => {
    e.preventDefault();
    if (selectedItem) {
      adjustInventoryMutation.mutate({
        id: selectedItem._id,
        adjustment: adjustmentData.adjustment,
        reason: adjustmentData.reason
      });
    }
  };

  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setIsAdjustModalOpen(true);
  };

  const getStockStatusColor = (item) => {
    if (item.quantity === 0) return 'bg-red-100 text-red-800';
    if (item.quantity <= item.reorderLevel) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (item) => {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  const inventory = inventoryData?.inventory || [];
  const products = productsData?.products || [];

  // Get available products not in inventory
  const availableProducts = products.filter(product => 
    !inventory.some(item => item.product._id === product._id)
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Inventory Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {store?.name} - Manage stock levels and track inventory
              </p>
            </div>
            <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
              <button
                onClick={() => queryClient.invalidateQueries(['inventory', storeId])}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Product
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                        <dd className="text-lg font-medium text-gray-900">{summary.totalProducts}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Inventory Value</dt>
                        <dd className="text-lg font-medium text-gray-900">${summary.totalValue?.toFixed(2) || '0.00'}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Low Stock</dt>
                        <dd className="text-lg font-medium text-gray-900">{summary.lowStock}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Archive className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                        <dd className="text-lg font-medium text-gray-900">{summary.outOfStock}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="instock">In Stock</option>
                <option value="lowstock">Low Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Household Items">Household Items</option>
                <option value="Snacks & Confectionery">Snacks & Confectionery</option>
                <option value="Dairy Products">Dairy Products</option>
              </select>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="mt-8">
            {inventory && inventory.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reorder Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.product.category} • {item.product.unit}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {item.quantity}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.product.unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item)}`}>
                              {getStockStatusText(item)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.reorderLevel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${(item.quantity * item.product.costPrice).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.location?.aisle ? `${item.location.aisle}-${item.location.shelf}` : 'Not set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openAdjustModal(item)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding products to your inventory.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Add Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Inventory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddInventory}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Add Product to Inventory
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Product</label>
                          <select
                            required
                            value={addInventoryData.productId}
                            onChange={(e) => setAddInventoryData(prev => ({ ...prev, productId: e.target.value }))}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="">Select a product</option>
                            {availableProducts.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name} - {product.category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={addInventoryData.quantity}
                              onChange={(e) => setAddInventoryData(prev => ({ ...prev, quantity: e.target.value }))}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Reorder Level</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={addInventoryData.reorderLevel}
                              onChange={(e) => setAddInventoryData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="10"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Aisle</label>
                            <input
                              type="text"
                              value={addInventoryData.location.aisle}
                              onChange={(e) => setAddInventoryData(prev => ({ 
                                ...prev, 
                                location: { ...prev.location, aisle: e.target.value }
                              }))}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="A1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Shelf</label>
                            <input
                              type="text"
                              value={addInventoryData.location.shelf}
                              onChange={(e) => setAddInventoryData(prev => ({ 
                                ...prev, 
                                location: { ...prev.location, shelf: e.target.value }
                              }))}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Top"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={addInventoryMutation.isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {addInventoryMutation.isLoading ? 'Adding...' : 'Add to Inventory'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Inventory Modal */}
      {isAdjustModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsAdjustModalOpen(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAdjustInventory}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Adjust Inventory
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsAdjustModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="mt-4">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-medium text-gray-900">{selectedItem.product.name}</h4>
                          <p className="text-sm text-gray-500">Current Stock: {selectedItem.quantity} {selectedItem.product.unit}</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Adjustment (+/-)
                            </label>
                            <input
                              type="number"
                              step="1"
                              required
                              value={adjustmentData.adjustment}
                              onChange={(e) => setAdjustmentData(prev => ({ ...prev, adjustment: e.target.value }))}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="e.g., +50 or -10"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              New quantity: {selectedItem.quantity + (parseInt(adjustmentData.adjustment) || 0)}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Reason</label>
                            <textarea
                              required
                              rows={3}
                              value={adjustmentData.reason}
                              onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Reason for adjustment (e.g., damaged goods, restock, etc.)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={adjustInventoryMutation.isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {adjustInventoryMutation.isLoading ? 'Adjusting...' : 'Adjust Inventory'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default InventoryManagement;