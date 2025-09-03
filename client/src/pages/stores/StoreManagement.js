import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StoreForm from '../../components/stores/StoreForm';
import StoreCard from '../../components/stores/StoreCard';
import StoreTable from '../../components/stores/StoreTable';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { cn } from '../../utils/cn';

const StoreManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    stores, 
    loading, 
    error, 
    loadStores, 
    deleteStore, 
    clearError 
  } = useStore();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [deletingStore, setDeletingStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleCreateStore = () => {
    setShowCreateForm(true);
    setEditingStore(null);
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setShowCreateForm(true);
  };

  const handleViewStore = (store) => {
    navigate(`/stores/${store._id}`);
  };

  const handleDeleteStore = (store) => {
    setDeletingStore(store);
  };

  const confirmDeleteStore = async () => {
    if (!deletingStore) return;

    try {
      const result = await deleteStore(deletingStore._id);
      if (result.success) {
        toast.success('Store deleted successfully');
        setDeletingStore(null);
      } else {
        toast.error(result.message || 'Failed to delete store');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the store');
    }
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingStore(null);
  };

  const handleFormSuccess = (store) => {
    if (editingStore) {
      toast.success('Store updated successfully');
    } else {
      toast.success('Store created successfully');
    }
    handleFormClose();
  };

  // Filter stores based on search and filters
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.address?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    const matchesType = typeFilter === 'all' || store.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const canCreateStore = user && (user.role === 'super_admin' || user.role === 'admin');
  const canEditStore = user && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'store_manager');
  const canDeleteStore = user && user.role === 'super_admin';

  if (loading && stores.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600">Manage your supermarket locations and operations</p>
        </div>
        
        {canCreateStore && (
          <button
            onClick={handleCreateStore}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Store
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stores</p>
              <p className="text-2xl font-semibold text-gray-900">{stores.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Stores</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stores.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 bg-yellow-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Under Construction</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stores.filter(s => s.status === 'under_construction').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stores.reduce((total, store) => total + (store.staff?.length || 0), 0)}
              </p>
            </div>
          </div>
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
                placeholder="Search stores by name, code, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
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
              <option value="under_construction">Under Construction</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="lg:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="supermarket">Supermarket</option>
              <option value="hypermarket">Hypermarket</option>
              <option value="convenience">Convenience Store</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'grid' 
                  ? "bg-primary-100 text-primary-600" 
                  : "text-gray-400 hover:text-gray-600"
              )}
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
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'table' 
                  ? "bg-primary-100 text-primary-600" 
                  : "text-gray-400 hover:text-gray-600"
              )}
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

      {/* Stores List */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'grid' ? (
          <div className="p-6">
            {filteredStores.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-gray-400 rounded"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first store'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && canCreateStore && (
                  <button
                    onClick={handleCreateStore}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Store
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map((store) => (
                  <StoreCard
                    key={store._id}
                    store={store}
                    onView={() => handleViewStore(store)}
                    onEdit={() => handleEditStore(store)}
                    onDelete={() => handleDeleteStore(store)}
                    canEdit={canEditStore}
                    canDelete={canDeleteStore}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <StoreTable
            stores={filteredStores}
            onView={handleViewStore}
            onEdit={handleEditStore}
            onDelete={handleDeleteStore}
            canEdit={canEditStore}
            canDelete={canDeleteStore}
          />
        )}
      </div>

      {/* Create/Edit Store Modal */}
      {showCreateForm && (
        <StoreForm
          store={editingStore}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingStore && (
        <DeleteConfirmModal
          isOpen={!!deletingStore}
          onClose={() => setDeletingStore(null)}
          onConfirm={confirmDeleteStore}
          title="Delete Store"
          message={`Are you sure you want to delete "${deletingStore.name}"? This action cannot be undone.`}
          confirmText="Delete Store"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default StoreManagement;