import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  Package, 
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StoreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [store, setStore] = useState(null);

  useEffect(() => {
    // Simulate loading store data
    setTimeout(() => {
      setStore({
        id: id,
        name: 'Yangon Central Store',
        nameMyanmar: 'ရန်ကုန်ဗဟိုစတိုး',
        code: 'STORE-001',
        type: 'supermarket',
        status: 'active',
        address: {
          street: '123 Main Street',
          city: 'Yangon',
          state: 'Yangon',
          postalCode: '11011',
          country: 'Myanmar'
        },
        contact: {
          phone: '01-234567',
          email: 'yangon@myanmarsupermarket.com',
          website: 'www.myanmarsupermarket.com'
        },
        businessHours: {
          monday: { open: '08:00', close: '22:00', closed: false },
          tuesday: { open: '08:00', close: '22:00', closed: false },
          wednesday: { open: '08:00', close: '22:00', closed: false },
          thursday: { open: '08:00', close: '22:00', closed: false },
          friday: { open: '08:00', close: '22:00', closed: false },
          saturday: { open: '08:00', close: '22:00', closed: false },
          sunday: { open: '08:00', close: '22:00', closed: false }
        },
        settings: {
          currency: 'MMK',
          language: 'en',
          timezone: 'Asia/Yangon',
          taxRate: 5,
          allowDiscounts: true,
          requireCustomerInfo: false
        },
        stats: {
          totalStaff: 45,
          totalProducts: 2500,
          totalCustomers: 15000,
          monthlyRevenue: 45000000,
          averageRating: 4.6
        },
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2024-01-18T00:00:00.000Z'
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      toast.success('Store updated successfully');
    } catch (error) {
      toast.error('Failed to update store');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    toast.info('Changes discarded');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
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
      case 'maintenance':
        return 'Maintenance';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'supermarket':
        return 'Supermarket';
      case 'convenience_store':
        return 'Convenience Store';
      case 'hypermarket':
        return 'Hypermarket';
      case 'wholesale':
        return 'Wholesale';
      default:
        return type;
    }
  };

  const formatCurrency = (amount, currency) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!store) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Store not found</h3>
          <p className="text-gray-600">The store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/stores')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-gray-600">{store.nameMyanmar}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Store
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Code</label>
                  <input
                    type="text"
                    value={store.code}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Type</label>
                  <select
                    value={store.type}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="supermarket">Supermarket</option>
                    <option value="convenience_store">Convenience Store</option>
                    <option value="hypermarket">Hypermarket</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={store.status}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={store.settings.currency}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="MMK">Myanmar Kyat (MMK)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Address</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={store.address.street}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={store.address.city}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={store.address.state}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={store.address.postalCode}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={store.contact.phone}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={store.contact.email}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={store.contact.website}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(store.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </span>
                    <div className="flex items-center gap-2">
                      {hours.closed ? (
                        <span className="text-sm text-gray-500">Closed</span>
                      ) : (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            disabled={!isEditing}
                            className="px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-50"
                          />
                          <span className="text-sm text-gray-500">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            disabled={!isEditing}
                            className="px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-50"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Store Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Store Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(store.status)}`}>
                  {getStatusText(store.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-medium text-gray-900">{getTypeText(store.type)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm text-gray-900">{formatDate(store.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-900">{formatDate(store.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Staff</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{store.stats.totalStaff}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Products</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{store.stats.totalProducts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Customers</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{store.stats.totalCustomers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(store.stats.monthlyRevenue, store.settings.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Rating</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{store.stats.averageRating}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/staff?store=${store.id}`)}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4 mr-3 text-blue-500" />
                Manage Staff
              </button>
              <button
                onClick={() => navigate(`/inventory?store=${store.id}`)}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Package className="w-4 h-4 mr-3 text-green-500" />
                View Inventory
              </button>
              <button
                onClick={() => navigate(`/sales?store=${store.id}`)}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <TrendingUp className="w-4 h-4 mr-3 text-yellow-500" />
                View Sales
              </button>
              <button
                onClick={() => navigate(`/reports?store=${store.id}`)}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4 mr-3 text-purple-500" />
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;