import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../Layout/Layout';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  X,
  DollarSign,
  BarChart3,
  Tag
} from 'lucide-react';

const ProductManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    category: '',
    brand: '',
    unit: 'piece',
    costPrice: '',
    sellingPrice: '',
    minStockLevel: '10',
    supplier: {
      name: '',
      contact: '',
      email: ''
    }
  });

  const queryClient = useQueryClient();

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', searchTerm, categoryFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      params.append('page', currentPage);
      params.append('limit', '12');
      
      const response = await axios.get(`/api/products?${params}`);
      return response.data;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await axios.get('/api/products/categories/list');
      return response.data;
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData) => {
      const response = await axios.post('/api/products', productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product created successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }) => {
      const response = await axios.put(`/api/products/${id}`, productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product updated successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      await axios.delete(`/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        barcode: product.barcode || '',
        category: product.category,
        brand: product.brand || '',
        unit: product.unit,
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        minStockLevel: product.minStockLevel.toString(),
        supplier: product.supplier || { name: '', contact: '', email: '' }
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        barcode: '',
        category: '',
        brand: '',
        unit: 'piece',
        costPrice: '',
        sellingPrice: '',
        minStockLevel: '10',
        supplier: {
          name: '',
          contact: '',
          email: ''
        }
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('supplier.')) {
      const supplierField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        supplier: {
          ...prev.supplier,
          [supplierField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert price fields to numbers
    const submitData = {
      ...formData,
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      minStockLevel: parseInt(formData.minStockLevel)
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, ...submitData });
    } else {
      createProductMutation.mutate(submitData);
    }
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const calculateProfitMargin = (costPrice, sellingPrice) => {
    if (!costPrice || !sellingPrice) return 0;
    return (((sellingPrice - costPrice) / costPrice) * 100).toFixed(1);
  };

  const products = productsData?.products || [];
  const totalPages = productsData?.totalPages || 1;

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
                Product Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your product catalog and inventory items
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Product
              </button>
            </div>
          </div>

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
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                {categories?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="mt-8">
            {products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <div key={product._id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <Package className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleOpenModal(product)}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {product.brand && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Tag className="flex-shrink-0 mr-1.5 h-3 w-3" />
                              {product.brand}
                            </div>
                          )}
                          {product.barcode && (
                            <div className="text-xs text-gray-500 font-mono">
                              {product.barcode}
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <span className="text-gray-500">Cost: </span>
                              <span className="font-medium">${product.costPrice}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Sell: </span>
                              <span className="font-medium text-green-600">${product.sellingPrice}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Unit: {product.unit}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              calculateProfitMargin(product.costPrice, product.sellingPrice) > 20
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {calculateProfitMargin(product.costPrice, product.sellingPrice)}% margin
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Min: {product.minStockLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
                <div className="mt-6">
                  <button
                    onClick={() => handleOpenModal()}
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

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-4">
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input
                              type="text"
                              name="name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Enter product name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Brand</label>
                            <input
                              type="text"
                              name="brand"
                              value={formData.brand}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Brand name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Product description"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                              name="category"
                              required
                              value={formData.category}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="">Select category</option>
                              {categories?.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                            <select
                              name="unit"
                              required
                              value={formData.unit}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="piece">Piece</option>
                              <option value="kg">Kilogram</option>
                              <option value="liter">Liter</option>
                              <option value="pack">Pack</option>
                              <option value="bottle">Bottle</option>
                              <option value="can">Can</option>
                              <option value="box">Box</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                            <input
                              type="number"
                              name="costPrice"
                              step="0.01"
                              min="0"
                              required
                              value={formData.costPrice}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                            <input
                              type="number"
                              name="sellingPrice"
                              step="0.01"
                              min="0"
                              required
                              value={formData.sellingPrice}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Min Stock Level</label>
                            <input
                              type="number"
                              name="minStockLevel"
                              min="0"
                              required
                              value={formData.minStockLevel}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Barcode</label>
                          <input
                            type="text"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Product barcode (optional)"
                          />
                        </div>

                        {/* Supplier Information */}
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Supplier Information (Optional)</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                              <input
                                type="text"
                                name="supplier.name"
                                value={formData.supplier.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Supplier name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Contact</label>
                              <input
                                type="text"
                                name="supplier.contact"
                                value={formData.supplier.contact}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Phone number"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              <input
                                type="email"
                                name="supplier.email"
                                value={formData.supplier.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Email address"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={createProductMutation.isLoading || updateProductMutation.isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {createProductMutation.isLoading || updateProductMutation.isLoading
                      ? 'Saving...'
                      : editingProduct
                      ? 'Update Product'
                      : 'Create Product'
                    }
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
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

export default ProductManagement;