import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, MapPin, Clock, Settings, Users, Phone, Mail, Building } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';

const StoreForm = ({ store, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { createStore, updateStore, loading } = useStore();
  const [activeTab, setActiveTab] = useState('basic');
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '18:00', closed: false },
    sunday: { open: '09:00', close: '18:00', closed: false }
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      code: '',
      type: 'supermarket',
      status: 'active',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Myanmar'
      },
      contact: {
        phone: '',
        email: '',
        website: ''
      },
      settings: {
        currency: 'MMK',
        taxRate: 5,
        discountEnabled: true,
        loyaltyEnabled: true,
        deliveryEnabled: false,
        parkingAvailable: true,
        wifiAvailable: false
      }
    }
  });

  const watchedType = watch('type');
  const watchedStatus = watch('status');

  useEffect(() => {
    if (store) {
      // Edit mode - populate form with existing data
      Object.keys(store).forEach(key => {
        if (key === 'address' || key === 'contact' || key === 'settings') {
          Object.keys(store[key] || {}).forEach(subKey => {
            setValue(`${key}.${subKey}`, store[key][subKey]);
          });
        } else {
          setValue(key, store[key]);
        }
      });

      // Set business hours
      if (store.businessHours) {
        setBusinessHours(store.businessHours);
      }
    } else {
      // Create mode - generate store code
      generateStoreCode();
    }
  }, [store, setValue]);

  const generateStoreCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const code = `STORE-${timestamp}-${random}`;
    setValue('code', code);
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleBusinessHoursToggle = (day) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed
      }
    }));
  };

  const onSubmit = async (data) => {
    try {
      const storeData = {
        ...data,
        businessHours,
        manager: store?.manager || null,
        staff: store?.staff || [],
        features: {
          parking: data.settings.parkingAvailable,
          wifi: data.settings.wifiAvailable,
          delivery: data.settings.deliveryEnabled,
          loyalty: data.settings.loyaltyEnabled,
          discount: data.settings.discountEnabled
        }
      };

      let result;
      if (store) {
        result = await updateStore(store._id, storeData);
      } else {
        result = await createStore(storeData);
      }

      if (result.success) {
        onSuccess(result.data);
      } else {
        toast.error(result.message || 'Failed to save store');
      }
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error('An error occurred while saving the store');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {store ? 'Edit Store' : 'Create New Store'}
            </h2>
            <p className="text-sm text-gray-600">
              {store ? 'Update store information' : 'Add a new store location'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Store name is required' })}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                        errors.name ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter store name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Code *
                    </label>
                    <input
                      type="text"
                      {...register('code', { required: 'Store code is required' })}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                        errors.code ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Store code"
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Type *
                    </label>
                    <select
                      {...register('type', { required: 'Store type is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="supermarket">Supermarket</option>
                      <option value="hypermarket">Hypermarket</option>
                      <option value="convenience">Convenience Store</option>
                      <option value="wholesale">Wholesale</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      {...register('status', { required: 'Status is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="under_construction">Under Construction</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter store description"
                  />
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    {...register('address.street')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register('address.city', { required: 'City is required' })}
                      className={cn(
                        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                        errors.address?.city ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter city"
                    />
                    {errors.address?.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Region
                    </label>
                    <input
                      type="text"
                      {...register('address.state')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter state/region"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      {...register('address.postalCode')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    {...register('address.country')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register('contact.phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('contact.email')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    {...register('contact.website')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
            )}

            {/* Business Hours Tab */}
            {activeTab === 'hours' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Set business hours for each day of the week. Toggle days off if the store is closed.
                </p>
                
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={() => handleBusinessHoursToggle(day)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">Open</span>
                    </div>
                    
                    {!hours.closed && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </>
                    )}
                    
                    {hours.closed && (
                      <span className="text-sm text-gray-500">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      {...register('settings.currency')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="MMK">Myanmar Kyat (MMK)</option>
                      <option value="USD">US Dollar (USD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      {...register('settings.taxRate', { min: 0, max: 100 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter tax rate"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Features</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('settings.discountEnabled')}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable Discounts</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('settings.loyaltyEnabled')}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Loyalty Program</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('settings.deliveryEnabled')}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Home Delivery</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('settings.parkingAvailable')}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Parking Available</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('settings.wifiAvailable')}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">WiFi Available</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting || loading ? 'Saving...' : (store ? 'Update Store' : 'Create Store')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreForm;