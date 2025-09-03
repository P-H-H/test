import React, { useState } from 'react';
import { MapPin, Clock, Users, Phone, Edit, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const StoreTable = ({ stores, onView, onEdit, onDelete, canEdit, canDelete }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedStores = () => {
    return [...stores].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle nested fields
      if (sortField === 'address.city') {
        aValue = a.address?.city || '';
        bValue = b.address?.city || '';
      } else if (sortField === 'contact.phone') {
        aValue = a.contact?.phone || '';
        bValue = b.contact?.phone || '';
      }

      // Handle date fields
      if (sortField === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle numeric fields
      if (sortField === 'staff') {
        aValue = aValue?.length || 0;
        bValue = bValue?.length || 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

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

  const isOpen = (store) => {
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

  const SortableHeader = ({ field, children, className = '' }) => (
    <th
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50",
        className
      )}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <div className="flex flex-col">
          <ChevronUp 
            className={cn(
              "w-3 h-3",
              sortField === field && sortDirection === 'asc' 
                ? "text-primary-600" 
                : "text-gray-300"
            )} 
          />
          <ChevronDown 
            className={cn(
              "w-3 h-3 -mt-1",
              sortField === field && sortDirection === 'desc' 
                ? "text-primary-600" 
                : "text-gray-300"
            )} 
          />
        </div>
      </div>
    </th>
  );

  const sortedStores = getSortedStores();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader field="name">
              Store Name
            </SortableHeader>
            <SortableHeader field="code">
              Code
            </SortableHeader>
            <SortableHeader field="type">
              Type
            </SortableHeader>
            <SortableHeader field="status">
              Status
            </SortableHeader>
            <SortableHeader field="address.city">
              Location
            </SortableHeader>
            <SortableHeader field="contact.phone">
              Contact
            </SortableHeader>
            <SortableHeader field="staff">
              Staff
            </SortableHeader>
            <SortableHeader field="createdAt">
              Created
            </SortableHeader>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedStores.map((store) => (
            <tr key={store._id} className="hover:bg-gray-50">
              {/* Store Name */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {store.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{store.name}</div>
                    <div className="text-sm text-gray-500">{store.code}</div>
                  </div>
                </div>
              </td>

              {/* Code */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {store.code}
                </span>
              </td>

              {/* Type */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{getTypeText(store.type)}</span>
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  getStatusColor(store.status)
                )}>
                  {getStatusText(store.status)}
                </span>
                <div className="mt-1">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    isOpen(store) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}>
                    {isOpen(store) ? 'Open' : 'Closed'}
                  </span>
                </div>
              </td>

              {/* Location */}
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <div className="text-sm text-gray-900">
                    {formatAddress(store.address)}
                  </div>
                </div>
              </td>

              {/* Contact */}
              <td className="px-6 py-4 whitespace-nowrap">
                {store.contact?.phone ? (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{store.contact.phone}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No phone</span>
                )}
              </td>

              {/* Staff */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">
                    {store.staff?.length || 0}
                  </span>
                </div>
              </td>

              {/* Created Date */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(store.createdAt).toLocaleDateString()}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(store)}
                    className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {canEdit && (
                    <button
                      onClick={() => onEdit(store)}
                      className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                      title="Edit Store"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  
                  {canDelete && (
                    <button
                      onClick={() => onDelete(store)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Delete Store"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedStores.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gray-400 rounded"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-600">No stores match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default StoreTable;