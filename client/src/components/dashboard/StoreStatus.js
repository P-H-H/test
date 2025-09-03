import React from 'react';
import { Clock, MapPin, Phone, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const StoreStatus = () => {
  // Mock store data
  const store = {
    name: 'Yangon Central Store',
    code: 'YGN001',
    status: 'active',
    isOpen: true,
    address: {
      street: '123 Bogyoke Aung San Road',
      city: 'Yangon',
      state: 'Yangon Region',
    },
    contact: {
      phone: '+95 1 234 5678',
      email: 'yangon@supermarket.com',
    },
    businessHours: {
      monday: { open: '09:00', close: '21:00', isOpen: true },
      tuesday: { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday: { open: '09:00', close: '21:00', isOpen: true },
      friday: { open: '09:00', close: '22:00', isOpen: true },
      saturday: { open: '09:00', close: '22:00', isOpen: true },
      sunday: { open: '10:00', close: '20:00', isOpen: true },
    },
  };

  const getStatusIcon = () => {
    if (store.isOpen) {
      return <CheckCircle className="w-5 h-5 text-success-600" />;
    }
    return <XCircle className="w-5 h-5 text-error-600" />;
  };

  const getStatusText = () => {
    if (store.isOpen) {
      return 'Open Now';
    }
    return 'Closed';
  };

  const getStatusColor = () => {
    if (store.isOpen) {
      return 'text-success-600 bg-success-100';
    }
    return 'text-error-600 bg-error-100';
  };

  const formatTime = (time) => {
    if (!time) return 'Closed';
    return time;
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    return days[today];
  };

  const getTodayHours = () => {
    const today = getCurrentDay();
    return store.businessHours[today];
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-900">Store Status</h3>
        <p className="text-sm text-neutral-600">Current store information</p>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Store Name and Status */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-neutral-900">{store.name}</h4>
            <p className="text-sm text-neutral-500">Store Code: {store.code}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </div>
          </div>
        </div>

        {/* Today's Hours */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 text-neutral-500 mr-2" />
            <span className="text-sm font-medium text-neutral-700">Today's Hours</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">
              {getCurrentDay().charAt(0).toUpperCase() + getCurrentDay().slice(1)}
            </span>
            <span className="text-sm font-medium text-neutral-900">
              {formatTime(getTodayHours()?.open)} - {formatTime(getTodayHours()?.close)}
            </span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-neutral-400 mr-3" />
            <div className="text-sm">
              <p className="text-neutral-900">{store.address.street}</p>
              <p className="text-neutral-600">{store.address.city}, {store.address.state}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Phone className="w-4 h-4 text-neutral-400 mr-3" />
            <span className="text-sm text-neutral-900">{store.contact.phone}</span>
          </div>
          
          <div className="flex items-center">
            <Globe className="w-4 h-4 text-neutral-400 mr-3" />
            <span className="text-sm text-neutral-900">{store.contact.email}</span>
          </div>
        </div>

        {/* Business Hours Summary */}
        <div className="border-t border-neutral-200 pt-4">
          <h5 className="text-sm font-medium text-neutral-700 mb-3">Business Hours</h5>
          <div className="space-y-2 text-xs">
            {Object.entries(store.businessHours).map(([day, hours]) => (
              <div key={day} className="flex justify-between">
                <span className="text-neutral-600 capitalize">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
                <span className="text-neutral-900">
                  {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-neutral-200 pt-4">
          <div className="flex space-x-2">
            <button className="flex-1 bg-primary-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-primary-700 transition-colors duration-200">
              View Details
            </button>
            <button className="flex-1 bg-neutral-100 text-neutral-700 text-sm font-medium py-2 px-3 rounded-lg hover:bg-neutral-200 transition-colors duration-200">
              Edit Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreStatus;