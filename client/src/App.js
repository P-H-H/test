import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import OwnerDashboard from './components/Owner/OwnerDashboard';
import EmployeeDashboard from './components/Employee/EmployeeDashboard';
import StoreManagement from './components/Owner/StoreManagement';
import EmployeeManagement from './components/Owner/EmployeeManagement';
import ProductManagement from './components/Common/ProductManagement';
import InventoryManagement from './components/Common/InventoryManagement';
import SalesManagement from './components/Common/SalesManagement';
import POS from './components/Common/POS';
import Profile from './components/Common/Profile';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Main App Routes
const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Owner Routes */}
      {user?.role === 'owner' && (
        <>
          <Route path="/" element={<OwnerDashboard />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/stores" element={<StoreManagement />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/inventory/:storeId" element={<InventoryManagement />} />
          <Route path="/sales/:storeId" element={<SalesManagement />} />
          <Route path="/pos/:storeId" element={<POS />} />
        </>
      )}
      
      {/* Employee Routes */}
      {user?.role === 'employee' && (
        <>
          <Route path="/" element={<EmployeeDashboard />} />
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/inventory/:storeId" element={<InventoryManagement />} />
          <Route path="/sales/:storeId" element={<SalesManagement />} />
          <Route path="/pos/:storeId" element={<POS />} />
        </>
      )}
      
      {/* Common Routes */}
      <Route path="/profile" element={<Profile />} />
      
      {/* Fallback Routes */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App">
              <AppRoutes />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
