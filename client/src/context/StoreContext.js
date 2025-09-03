import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const StoreContext = createContext();

const initialState = {
  currentStore: null,
  stores: [],
  loading: false,
  error: null,
  storeStats: null,
  storeSettings: null
};

const storeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_STORES':
      return { ...state, stores: action.payload, loading: false };
    
    case 'SET_CURRENT_STORE':
      return { ...state, currentStore: action.payload };
    
    case 'ADD_STORE':
      return { ...state, stores: [...state.stores, action.payload] };
    
    case 'UPDATE_STORE':
      return {
        ...state,
        stores: state.stores.map(store => 
          store._id === action.payload._id ? action.payload : store
        ),
        currentStore: state.currentStore?._id === action.payload._id 
          ? action.payload 
          : state.currentStore
      };
    
    case 'DELETE_STORE':
      return {
        ...state,
        stores: state.stores.filter(store => store._id !== action.payload),
        currentStore: state.currentStore?._id === action.payload ? null : state.currentStore
      };
    
    case 'SET_STORE_STATS':
      return { ...state, storeStats: action.payload };
    
    case 'SET_STORE_SETTINGS':
      return { ...state, storeSettings: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
};

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const { user, token } = useAuth();

  // Load stores on component mount
  useEffect(() => {
    if (token && user) {
      loadStores();
    }
  }, [token, user]);

  // Set current store based on user's store assignment
  useEffect(() => {
    if (user?.storeId && state.stores.length > 0) {
      const userStore = state.stores.find(store => store._id === user.storeId);
      if (userStore) {
        setCurrentStore(userStore);
      }
    }
  }, [user?.storeId, state.stores]);

  const loadStores = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.get('/stores');
      
      if (response.data.success) {
        dispatch({ type: 'SET_STORES', payload: response.data.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.data.message });
      }
    } catch (error) {
      console.error('Error loading stores:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to load stores' 
      });
    }
  };

  const createStore = async (storeData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.post('/stores', storeData);
      
      if (response.data.success) {
        dispatch({ type: 'ADD_STORE', payload: response.data.data });
        return { success: true, data: response.data.data };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.data.message });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Error creating store:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create store';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const updateStore = async (storeId, updateData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.put(`/stores/${storeId}`, updateData);
      
      if (response.data.success) {
        dispatch({ type: 'UPDATE_STORE', payload: response.data.data });
        return { success: true, data: response.data.data };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.data.message });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Error updating store:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update store';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const deleteStore = async (storeId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.delete(`/stores/${storeId}`);
      
      if (response.data.success) {
        dispatch({ type: 'DELETE_STORE', payload: storeId });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.data.message });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete store';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const setCurrentStore = (store) => {
    dispatch({ type: 'SET_CURRENT_STORE', payload: store });
    // Store in localStorage for persistence
    if (store) {
      localStorage.setItem('currentStore', JSON.stringify(store));
    } else {
      localStorage.removeItem('currentStore');
    }
  };

  const getStoreById = (storeId) => {
    return state.stores.find(store => store._id === storeId);
  };

  const getStoreStats = async (storeId = null) => {
    try {
      const targetStoreId = storeId || state.currentStore?._id;
      if (!targetStoreId) {
        throw new Error('No store selected');
      }

      const response = await api.get(`/stores/${targetStoreId}/stats`);
      
      if (response.data.success) {
        dispatch({ type: 'SET_STORE_STATS', payload: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error loading store stats:', error);
      throw error;
    }
  };

  const getStoreDashboard = async (storeId = null) => {
    try {
      const targetStoreId = storeId || state.currentStore?._id;
      if (!targetStoreId) {
        throw new Error('No store selected');
      }

      const response = await api.get(`/stores/${targetStoreId}/dashboard`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error loading store dashboard:', error);
      throw error;
    }
  };

  const getStoreSettings = async (storeId = null) => {
    try {
      const targetStoreId = storeId || state.currentStore?._id;
      if (!targetStoreId) {
        throw new Error('No store selected');
      }

      const store = getStoreById(targetStoreId);
      if (store) {
        dispatch({ type: 'SET_STORE_SETTINGS', payload: store.settings });
        return store.settings;
      } else {
        throw new Error('Store not found');
      }
    } catch (error) {
      console.error('Error loading store settings:', error);
      throw error;
    }
  };

  const updateStoreSettings = async (storeId, settings) => {
    try {
      const result = await updateStore(storeId, { settings });
      if (result.success) {
        dispatch({ type: 'SET_STORE_SETTINGS', payload: result.data.settings });
      }
      return result;
    } catch (error) {
      console.error('Error updating store settings:', error);
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  // Check if user can access a specific store
  const canAccessStore = (storeId) => {
    if (!user) return false;
    
    // Super admin can access all stores
    if (user.role === 'super_admin') return true;
    
    // Admin can access all stores
    if (user.role === 'admin') return true;
    
    // Store manager can only access their assigned store
    if (user.role === 'store_manager') {
      return user.storeId === storeId;
    }
    
    // Staff can only access their assigned store
    if (user.role === 'staff') {
      return user.storeId === storeId;
    }
    
    return false;
  };

  // Get stores user can access
  const getAccessibleStores = () => {
    if (!user) return [];
    
    // Super admin and admin can access all stores
    if (user.role === 'super_admin' || user.role === 'admin') {
      return state.stores;
    }
    
    // Store manager and staff can only access their assigned store
    if (user.storeId) {
      return state.stores.filter(store => store._id === user.storeId);
    }
    
    return [];
  };

  const value = {
    // State
    currentStore: state.currentStore,
    stores: state.stores,
    loading: state.loading,
    error: state.error,
    storeStats: state.storeStats,
    storeSettings: state.storeSettings,
    
    // Actions
    loadStores,
    createStore,
    updateStore,
    deleteStore,
    setCurrentStore,
    getStoreById,
    getStoreStats,
    getStoreDashboard,
    getStoreSettings,
    updateStoreSettings,
    clearError,
    reset,
    
    // Utilities
    canAccessStore,
    getAccessibleStores
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};