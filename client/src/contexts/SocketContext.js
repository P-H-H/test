import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000', {
        auth: {
          userId: user._id,
          role: user.role
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Join user-specific room
        newSocket.emit('join-user-room', user._id);
        
        // Join store rooms for assigned stores
        if (user.assignedStores) {
          user.assignedStores.forEach(store => {
            newSocket.emit('join-store', store._id || store);
          });
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Listen for real-time notifications
      newSocket.on('inventory-low-stock', (data) => {
        toast.error(`Low stock alert: ${data.productName} in ${data.storeName}`, {
          duration: 6000,
          icon: '⚠️'
        });
        addNotification({
          id: Date.now(),
          type: 'warning',
          title: 'Low Stock Alert',
          message: `${data.productName} is running low in ${data.storeName}`,
          timestamp: new Date(),
          storeId: data.storeId
        });
      });

      newSocket.on('inventory-out-of-stock', (data) => {
        toast.error(`Out of stock: ${data.productName} in ${data.storeName}`, {
          duration: 8000,
          icon: '🚨'
        });
        addNotification({
          id: Date.now(),
          type: 'error',
          title: 'Out of Stock',
          message: `${data.productName} is out of stock in ${data.storeName}`,
          timestamp: new Date(),
          storeId: data.storeId
        });
      });

      newSocket.on('new-sale', (data) => {
        if (user.role === 'owner' || user.assignedStores?.includes(data.storeId)) {
          toast.success(`New sale: ${data.receiptNumber} - $${data.totalAmount}`, {
            duration: 4000,
            icon: '💰'
          });
          addNotification({
            id: Date.now(),
            type: 'success',
            title: 'New Sale',
            message: `Sale ${data.receiptNumber} completed for $${data.totalAmount}`,
            timestamp: new Date(),
            storeId: data.storeId
          });
        }
      });

      newSocket.on('employee-assigned', (data) => {
        if (user._id === data.employeeId) {
          toast.success(`You've been assigned to ${data.storeName}`, {
            duration: 5000,
            icon: '🏪'
          });
          addNotification({
            id: Date.now(),
            type: 'info',
            title: 'Store Assignment',
            message: `You've been assigned to ${data.storeName}`,
            timestamp: new Date(),
            storeId: data.storeId
          });
        }
      });

      newSocket.on('inventory-updated', (data) => {
        // Trigger query invalidation for real-time updates
        if (window.queryClient) {
          window.queryClient.invalidateQueries(['inventory', data.storeId]);
          window.queryClient.invalidateQueries(['inventory-summary', data.storeId]);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const emitInventoryUpdate = (storeId, productId, newQuantity, reorderLevel) => {
    if (socket && isConnected) {
      socket.emit('inventory-update', {
        storeId,
        productId,
        newQuantity,
        reorderLevel,
        userId: user._id
      });
    }
  };

  const emitSaleCompleted = (saleData) => {
    if (socket && isConnected) {
      socket.emit('sale-completed', {
        ...saleData,
        userId: user._id
      });
    }
  };

  const value = {
    socket,
    isConnected,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    emitInventoryUpdate,
    emitSaleCompleted
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;