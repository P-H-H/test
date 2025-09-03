import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Simulate loading suppliers
    setTimeout(() => {
      setSuppliers([
        {
          id: 1,
          supplierId: 'SUP-001234',
          name: 'Myanmar Rice Co.',
          nameMyanmar: 'မြန်မာဆန်ကုမ္ပဏီ',
          category: 'grains',
          contactPerson: 'U Aung Kyaw',
          email: 'info@myanmarrice.com',
          phone: '01-234567',
          address: {
            street: '123 Industrial Zone',
            city: 'Yangon',
            state: 'Yangon',
            postalCode: '11011',
            country: 'Myanmar'
          },
          businessType: 'manufacturer',
          taxId: 'TAX-001234',
          registrationNumber: 'REG-001234',
          establishedDate: '2015-03-15',
          status: 'active',
          rating: 4.8,
          totalOrders: 156,
          totalValue: 45000000,
          currency: 'MMK',
          paymentTerms: 'net_30',
          creditLimit: 5000000,
          currentBalance: 1250000,
          certifications: ['ISO_9001', 'HACCP', 'Organic'],
          products: ['white_rice', 'brown_rice', 'jasmine_rice'],
          leadTime: 7,
          minimumOrder: 1000,
          unit: 'kg',
          notes: 'Reliable supplier for premium rice products',
          tags: ['premium', 'organic', 'reliable']
        },
        {
          id: 2,
          supplierId: 'SUP-001235',
          name: 'Fresh Vegetable Market',
          nameMyanmar: 'ဟင်းသီးဟင်းရွက်လတ်လတ်',
          category: 'vegetables',
          contactPerson: 'Daw Hla Hla',
          email: 'info@freshvegmarket.com',
          phone: '01-345678',
          address: {
            street: '456 Market Street',
            city: 'Mandalay',
            state: 'Mandalay',
            postalCode: '05001',
            country: 'Myanmar'
          },
          businessType: 'wholesaler',
          taxId: 'TAX-001235',
          registrationNumber: 'REG-001235',
          establishedDate: '2018-06-20',
          status: 'active',
          rating: 4.2,
          totalOrders: 89,
          totalValue: 18000000,
          currency: 'MMK',
          paymentTerms: 'net_15',
          creditLimit: 2000000,
          currentBalance: 450000,
          certifications: ['HACCP', 'Fresh_Produce'],
          products: ['tomatoes', 'onions', 'potatoes', 'carrots'],
          leadTime: 2,
          minimumOrder: 100,
          unit: 'kg',
          notes: 'Local fresh vegetable supplier',
          tags: ['local', 'fresh', 'seasonal']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddSupplier = () => {
    toast.info('Add supplier form will be implemented next');
  };

  const handleViewSupplier = (supplier) => {
    toast.info(`View supplier: ${supplier.name}`);
  };

  const handleEditSupplier = (supplier) => {
    toast.info(`Edit supplier: ${supplier.name}`);
  };

  const handleDeleteSupplier = (supplier) => {
    toast.info(`Delete supplier: ${supplier.name}`);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.supplierId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    
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
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'suspended':
        return 'Suspended';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const getBusinessTypeText = (type) => {
    switch (type) {
      case 'manufacturer':
        return 'Manufacturer';
      case 'wholesaler':
        return 'Wholesaler';
      case 'distributor':
        return 'Distributor';
      case 'importer':
        return 'Importer';
      case 'exporter':
        return 'Exporter';
      default:
        return type;
    }
  };

  const getPaymentTermsText = (terms) => {
    switch (terms) {
      case 'net_15':
        return 'Net 15';
      case 'net_30':
        return 'Net 30';
      case 'net_45':
        return 'Net 45';
      case 'net_60':
        return 'Net 60';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return terms;
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateYearsEstablished = (establishedDate) => {
    const today = new Date();
    const established = new Date(establishedDate);
    const years = today.getFullYear() - established.getFullYear();
    return years;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const totalOrders = suppliers.reduce((sum, s) => sum + s.totalOrders, 0);
  const totalValue = suppliers.reduce((sum, s) => sum + s.totalValue, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600">Manage supplier relationships, track performance, and monitor supply chain</p>
        </div>
        
        <button
          onClick={handleAddSupplier}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-semibold text-gray-900">{totalSuppliers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-semibold text-gray-900">{activeSuppliers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(totalValue, 'MMK')}
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
            onClick={handleAddSupplier}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Add Supplier</p>
              <p className="text-xs text-gray-500">Create new supplier</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Performance reviews will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Performance Review</p>
              <p className="text-xs text-gray-500">Evaluate suppliers</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Supply chain analytics will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500">Supply chain insights</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Contract management will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Contracts</p>
              <p className="text-xs text-gray-500">Manage agreements</p>
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
                placeholder="Search suppliers by name, ID, contact person, or email..."
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
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
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

      {/* Suppliers List */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'grid' ? (
          <div className="p-6">
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-600">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first supplier'
                  }
                </p>
                {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                  <button
                    onClick={handleAddSupplier}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Supplier
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.name}</h3>
                          {supplier.nameMyanmar && (
                            <p className="text-sm text-gray-600 mb-2">{supplier.nameMyanmar}</p>
                          )}
                          <p className="text-sm text-gray-500 mb-2">{supplier.supplierId}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                              {getStatusText(supplier.status)}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {getCategoryText(supplier.category)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Contact Info */}
                      <div>
                        <p className="text-sm text-gray-600">Contact Information</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{supplier.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{supplier.email}</span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-600">Contact Person</p>
                          <p className="text-sm text-gray-900">{supplier.contactPerson}</p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Address</p>
                        <div className="flex items-start gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="text-sm text-gray-900">
                            {supplier.address.street}, {supplier.address.city}, {supplier.address.state}
                          </div>
                        </div>
                      </div>

                      {/* Business Info */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">Business Type</p>
                            <p className="text-sm text-gray-900">{getBusinessTypeText(supplier.businessType)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Established</p>
                            <p className="text-sm text-gray-900">{calculateYearsEstablished(supplier.establishedDate)} years ago</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Tax ID</p>
                          <p className="text-sm text-gray-900">{supplier.taxId}</p>
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Performance</p>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                          <div>
                            <p className="text-xs text-gray-500">Rating</p>
                            <div className="flex items-center gap-1">
                              <span className={`text-sm font-medium ${getRatingColor(supplier.rating)}`}>
                                {supplier.rating}
                              </span>
                              <Star className={`w-4 h-4 ${getRatingColor(supplier.rating)}`} />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Orders</p>
                            <p className="text-sm font-medium text-gray-900">{supplier.totalOrders}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Total Value</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(supplier.totalValue, supplier.currency)}
                          </p>
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Financial Information</p>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                          <div>
                            <p className="text-xs text-gray-500">Payment Terms</p>
                            <p className="text-sm text-gray-900">{getPaymentTermsText(supplier.paymentTerms)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Credit Limit</p>
                            <p className="text-sm text-gray-900">
                              {formatPrice(supplier.creditLimit, supplier.currency)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Current Balance</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(supplier.currentBalance, supplier.currency)}
                          </p>
                        </div>
                      </div>

                      {/* Products & Services */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Products & Services</p>
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">Main Products</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {supplier.products.map((product, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {product.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Lead Time</p>
                          <p className="text-sm text-gray-900">{supplier.leadTime} days</p>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Minimum Order</p>
                          <p className="text-sm text-gray-900">
                            {supplier.minimumOrder} {supplier.unit}
                          </p>
                        </div>
                      </div>

                      {/* Certifications */}
                      {supplier.certifications && supplier.certifications.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Certifications</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {supplier.certifications.map((cert, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {cert.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {supplier.notes && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="text-sm text-gray-900">{supplier.notes}</p>
                        </div>
                      )}

                      {/* Tags */}
                      {supplier.tags && supplier.tags.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Tags</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {supplier.tags.map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tag.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Established: {formatDate(supplier.establishedDate)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewSupplier(supplier)}
                            className="px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditSupplier(supplier)}
                            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(supplier)}
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
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact & Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business & Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Financial & Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Truck className="w-6 h-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.supplierId}</div>
                          {supplier.nameMyanmar && (
                            <div className="text-sm text-gray-500">{supplier.nameMyanmar}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.contactPerson}</div>
                      <div className="text-sm text-gray-500">{supplier.phone}</div>
                      <div className="text-sm text-gray-500">{supplier.email}</div>
                      <div className="text-sm text-gray-500">
                        {supplier.address.city}, {supplier.address.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getBusinessTypeText(supplier.businessType)}</div>
                      <div className="text-sm text-gray-500">
                        {calculateYearsEstablished(supplier.establishedDate)} years
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                        {getStatusText(supplier.status)}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-sm font-medium ${getRatingColor(supplier.rating)}`}>
                          {supplier.rating}
                        </span>
                        <Star className={`w-4 h-4 ${getRatingColor(supplier.rating)}`} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getPaymentTermsText(supplier.paymentTerms)}</div>
                      <div className="text-sm text-gray-900">
                        {formatPrice(supplier.creditLimit, supplier.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {supplier.totalOrders} orders
                      </div>
                      <div className="text-sm text-gray-500">
                        {supplier.products.length} products
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSupplier(supplier)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                          title="View Supplier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSupplier(supplier)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                          title="Edit Supplier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-600">No suppliers match your current filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierManagement;