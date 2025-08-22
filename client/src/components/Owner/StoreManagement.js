import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../Layout/Layout';
import { 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Clock,
  Eye,
  X
} from 'lucide-react';

const StoreManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phone: '',
    email: '',
    openingHours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '21:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '10:00', close: '20:00' }
    }
  });

  const queryClient = useQueryClient();

  // Fetch stores
  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await axios.get('/api/stores');
      return response.data;
    },
  });

  // Create store mutation
  const createStoreMutation = useMutation({
    mutationFn: async (storeData) => {
      const response = await axios.post('/api/stores', storeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stores']);
      toast.success('Store created successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create store');
    },
  });

  // Update store mutation
  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, ...storeData }) => {
      const response = await axios.put(`/api/stores/${id}`, storeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stores']);
      toast.success('Store updated successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update store');
    },
  });

  // Delete store mutation
  const deleteStoreMutation = useMutation({
    mutationFn: async (storeId) => {
      await axios.delete(`/api/stores/${storeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stores']);
      toast.success('Store deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete store');
    },
  });

  const handleOpenModal = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        address: store.address,
        phone: store.phone,
        email: store.email || '',
        openingHours: store.openingHours || formData.openingHours
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        phone: '',
        email: '',
        openingHours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '09:00', close: '21:00' },
          sunday: { open: '10:00', close: '20:00' }
        }
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStore(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleHoursChange = (day, type, value) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [type]: value
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStore) {
      updateStoreMutation.mutate({ id: editingStore._id, ...formData });
    } else {
      createStoreMutation.mutate(formData);
    }
  };

  const handleDelete = (storeId) => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      deleteStoreMutation.mutate(storeId);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
                Store Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your store locations and their details
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Store
              </button>
            </div>
          </div>

          {/* Stores Grid */}
          <div className="mt-8">
            {stores && stores.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stores.map((store) => (
                  <div key={store._id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Store className="h-8 w-8 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              {store.address.city}, {store.address.state}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModal(store)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(store._id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-2 h-4 w-4" />
                          {store.address.street}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="flex-shrink-0 mr-2 h-4 w-4" />
                          {store.phone}
                        </div>
                        {store.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="flex-shrink-0 mr-2 h-4 w-4" />
                            {store.email}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="flex-shrink-0 mr-2 h-4 w-4" />
                          {store.employees?.length || 0} employees
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between">
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            View Details
                          </button>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {store.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Store className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No stores</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new store.</p>
                <div className="mt-6">
                  <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Add Store
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {editingStore ? 'Edit Store' : 'Add New Store'}
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
                        {/* Store Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Store Name</label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter store name"
                          />
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <input
                            type="text"
                            name="address.street"
                            required
                            value={formData.address.street}
                            onChange={handleInputChange}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Street address"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              name="address.city"
                              required
                              value={formData.address.city}
                              onChange={handleInputChange}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="City"
                            />
                            <input
                              type="text"
                              name="address.state"
                              required
                              value={formData.address.state}
                              onChange={handleInputChange}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="State"
                            />
                          </div>
                          <input
                            type="text"
                            name="address.zipCode"
                            required
                            value={formData.address.zipCode}
                            onChange={handleInputChange}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="ZIP Code"
                          />
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                              type="tel"
                              name="phone"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Phone number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
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

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={createStoreMutation.isLoading || updateStoreMutation.isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {createStoreMutation.isLoading || updateStoreMutation.isLoading
                      ? 'Saving...'
                      : editingStore
                      ? 'Update Store'
                      : 'Create Store'
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

export default StoreManagement;