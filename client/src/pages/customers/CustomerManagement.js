import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Star, 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Gift,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Crown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loyaltyFilter, setLoyaltyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Simulate loading customers
    setTimeout(() => {
      setCustomers([
        {
          id: 1,
          customerId: 'CUST-001234',
          firstName: 'Hla',
          lastName: 'Hla',
          firstNameMyanmar: 'လှ',
          lastNameMyanmar: 'လှ',
          email: 'hla.hla@example.com',
          phone: '09-12345678',
          address: {
            street: '123 Main Street',
            city: 'Yangon',
            state: 'Yangon',
            postalCode: '11011',
            country: 'Myanmar'
          },
          dateOfBirth: '1985-03-15',
          gender: 'female',
          loyalty: {
            tier: 'gold',
            points: 1250,
            joinDate: '2022-01-15',
            totalSpent: 450000,
            lastPurchaseDate: '2024-01-18'
          },
          preferences: {
            favoriteCategories: ['fresh_produce', 'dairy'],
            preferredPayment: 'mobile_money',
            marketingConsent: true,
            smsNotifications: true,
            emailNotifications: true
          },
          purchaseHistory: {
            totalOrders: 45,
            totalSpent: 450000,
            averageOrderValue: 10000,
            lastPurchaseDate: '2024-01-18',
            favoriteStore: 'Yangon Central Store'
          },
          status: 'active',
          notes: 'Loyal customer, prefers organic products',
          tags: ['loyal', 'organic', 'high_value']
        },
        {
          id: 2,
          customerId: 'CUST-001235',
          firstName: 'Min',
          lastName: 'Min',
          firstNameMyanmar: 'မင်း',
          lastNameMyanmar: 'မင်း',
          email: 'min.min@example.com',
          phone: '09-23456789',
          address: {
            street: '456 Oak Avenue',
            city: 'Mandalay',
            state: 'Mandalay',
            postalCode: '05001',
            country: 'Myanmar'
          },
          dateOfBirth: '1990-07-22',
          gender: 'male',
          loyalty: {
            tier: 'silver',
            points: 750,
            joinDate: '2023-03-20',
            totalSpent: 280000,
            lastPurchaseDate: '2024-01-15'
          },
          preferences: {
            favoriteCategories: ['meat', 'beverages'],
            preferredPayment: 'cash',
            marketingConsent: false,
            smsNotifications: true,
            emailNotifications: false
          },
          purchaseHistory: {
            totalOrders: 28,
            totalSpent: 280000,
            averageOrderValue: 10000,
            lastPurchaseDate: '2024-01-15',
            favoriteStore: 'Mandalay Store'
          },
          status: 'active',
          notes: 'Regular customer, likes meat products',
          tags: ['regular', 'meat_lover']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddCustomer = () => {
    toast.info('Add customer form will be implemented next');
  };

  const handleViewCustomer = (customer) => {
    toast.info(`View customer: ${customer.firstName} ${customer.lastName}`);
  };

  const handleEditCustomer = (customer) => {
    toast.info(`Edit customer: ${customer.firstName} ${customer.lastName}`);
  };

  const handleDeleteCustomer = (customer) => {
    toast.info(`Delete customer: ${customer.firstName} ${customer.lastName}`);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesLoyalty = loyaltyFilter === 'all' || customer.loyalty.tier === loyaltyFilter;
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesLoyalty && matchesStatus;
  });

  const getLoyaltyTierColor = (tier) => {
    switch (tier) {
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      case 'bronze':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoyaltyTierText = (tier) => {
    switch (tier) {
      case 'platinum':
        return 'Platinum';
      case 'gold':
        return 'Gold';
      case 'silver':
        return 'Silver';
      case 'bronze':
        return 'Bronze';
      default:
        return tier;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
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
      default:
        return status;
    }
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case 'male':
        return 'Male';
      case 'female':
        return 'Female';
      case 'other':
        return 'Other';
      default:
        return gender;
    }
  };

  const formatPrice = (price, currency = 'MMK') => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyalty.points, 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.purchaseHistory.totalSpent, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customer relationships, loyalty programs, and preferences</p>
        </div>
        
        <button
          onClick={handleAddCustomer}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{activeCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Loyalty Points</p>
              <p className="text-2xl font-semibold text-gray-900">{totalLoyaltyPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(totalRevenue, 'MMK')}
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
            onClick={handleAddCustomer}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Add Customer</p>
              <p className="text-xs text-gray-500">Create new customer</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Loyalty program will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Crown className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Loyalty Program</p>
              <p className="text-xs text-gray-500">Manage rewards</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Customer analytics will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500">Customer insights</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Marketing campaigns will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Marketing</p>
              <p className="text-xs text-gray-500">Send campaigns</p>
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
                placeholder="Search customers by name, ID, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Loyalty Tier Filter */}
          <div className="lg:w-48">
            <select
              value={loyaltyFilter}
              onChange={(e) => setLoyaltyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Loyalty Tiers</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
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

      {/* Customers List */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'grid' ? (
          <div className="p-6">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-600">
                  {searchTerm || loyaltyFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first customer'
                  }
                </p>
                {!searchTerm && loyaltyFilter === 'all' && statusFilter === 'all' && (
                  <button
                    onClick={handleAddCustomer}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {customer.firstName} {customer.lastName}
                          </h3>
                          {customer.firstNameMyanmar && customer.lastNameMyanmar && (
                            <p className="text-sm text-gray-600 mb-2">
                              {customer.firstNameMyanmar} {customer.lastNameMyanmar}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mb-2">{customer.customerId}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLoyaltyTierColor(customer.loyalty.tier)}`}>
                              {getLoyaltyTierText(customer.loyalty.tier)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                              {getStatusText(customer.status)}
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
                          <span className="text-sm text-gray-900">{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{customer.email}</span>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Address</p>
                        <div className="flex items-start gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="text-sm text-gray-900">
                            {customer.address.street}, {customer.address.city}, {customer.address.state}
                          </div>
                        </div>
                      </div>

                      {/* Personal Info */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">Age</p>
                            <p className="text-sm text-gray-900">{calculateAge(customer.dateOfBirth)} years</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="text-sm text-gray-900">{getGenderText(customer.gender)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Loyalty Info */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Loyalty Program</p>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                          <div>
                            <p className="text-xs text-gray-500">Points</p>
                            <p className="text-sm font-medium text-gray-900">{customer.loyalty.points.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Member Since</p>
                            <p className="text-sm text-gray-900">{formatDate(customer.loyalty.joinDate)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Purchase History */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Purchase History</p>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                          <div>
                            <p className="text-xs text-gray-500">Total Orders</p>
                            <p className="text-sm font-medium text-gray-900">{customer.purchaseHistory.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Spent</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(customer.purchaseHistory.totalSpent, 'MMK')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">Average Order Value</p>
                          <p className="text-sm text-gray-900">
                            {formatPrice(customer.purchaseHistory.averageOrderValue, 'MMK')}
                          </p>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">Last Purchase</p>
                          <p className="text-sm text-gray-900">
                            {formatDate(customer.purchaseHistory.lastPurchaseDate)}
                          </p>
                        </div>
                      </div>

                      {/* Preferences */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600">Preferences</p>
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">Favorite Categories</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {customer.preferences.favoriteCategories.map((category, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {category.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Preferred Payment</p>
                          <p className="text-sm text-gray-900">{customer.preferences.preferredPayment.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {/* Notes */}
                      {customer.notes && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="text-sm text-gray-900">{customer.notes}</p>
                        </div>
                      )}

                      {/* Tags */}
                      {customer.tags && customer.tags.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Tags</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {customer.tags.map((tag, index) => (
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
                          Joined: {formatDate(customer.loyalty.joinDate)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer)}
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
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact & Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loyalty & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase History
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{customer.customerId}</div>
                          {customer.firstNameMyanmar && customer.lastNameMyanmar && (
                            <div className="text-sm text-gray-500">
                              {customer.firstNameMyanmar} {customer.lastNameMyanmar}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                      <div className="text-sm text-gray-500">
                        {customer.address.city}, {customer.address.state}
                      </div>
                      <div className="text-sm text-gray-500">
                        Age: {calculateAge(customer.dateOfBirth)} | {getGenderText(customer.gender)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLoyaltyTierColor(customer.loyalty.tier)}`}>
                        {getLoyaltyTierText(customer.loyalty.tier)}
                      </span>
                      <div className="text-sm text-gray-900 mt-1">
                        {customer.loyalty.points.toLocaleString()} points
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)} mt-1`}>
                        {getStatusText(customer.status)}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        Since {formatDate(customer.loyalty.joinDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.purchaseHistory.totalOrders} orders</div>
                      <div className="text-sm text-gray-900">
                        {formatPrice(customer.purchaseHistory.totalSpent, 'MMK')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg: {formatPrice(customer.purchaseHistory.averageOrderValue, 'MMK')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last: {formatDate(customer.purchaseHistory.lastPurchaseDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                          title="View Customer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-600">No customers match your current filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;