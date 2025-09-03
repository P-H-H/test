import React, { useState } from 'react';
import { MapPin, Clock, Users, Phone, MoreVertical, Edit, Trash2, Eye, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';

const StoreCard = ({ store, onView, onEdit, onDelete, canEdit, canDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'under_construction':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
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
      case 'under_construction':
        return 'Under Construction';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'supermarket':
        return 'Supermarket';
      case 'hypermarket':
        return 'Hypermarket';
      case 'convenience':
        return 'Convenience Store';
      case 'wholesale':
        return 'Wholesale';
      default:
        return type;
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

  const formatBusinessHours = (businessHours) => {
    if (!businessHours || !businessHours.monday) return 'Not set';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
    const todayHours = businessHours[today];
    
    if (todayHours && todayHours.open && todayHours.close) {
      return `${todayHours.open} - ${todayHours.close}`;
    }
    
    return 'Not set';
  };

  const isOpen = () => {
    if (!store.businessHours) return false;
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
    const todayHours = store.businessHours[today];
    
    if (!todayHours || !todayHours.open || !todayHours.close) return false;
    
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{store.code}</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                getStatusColor(store.status)
              )}>
                {getStatusText(store.status)}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {getTypeText(store.type)}
              </span>
            </div>
          </div>
          
          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onView();
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                
                {canEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Store
                  </button>
                )}
                
                {canDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Store
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-900">{formatAddress(store.address)}</p>
            {store.address?.coordinates && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {store.address.coordinates.latitude.toFixed(4)}, {store.address.coordinates.longitude.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-900">
              Today: {formatBusinessHours(store.businessHours)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                isOpen() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                {isOpen() ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact */}
        {store.contact?.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-900">{store.contact.phone}</p>
          </div>
        )}

        {/* Staff Count */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <p className="text-sm text-gray-900">
            {store.staff?.length || 0} staff members
          </p>
        </div>

        {/* Settings Info */}
        {store.settings && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Currency: {store.settings.currency || 'MMK'}</span>
              <span>Tax: {store.settings.taxRate || 0}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created: {new Date(store.createdAt).toLocaleDateString()}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
            >
              View Details
            </button>
            
            {canEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;