import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';

// Layout components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Authentication pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main application pages
import Dashboard from './pages/Dashboard';
import StoreManagement from './pages/stores/StoreManagement';
import StoreDetails from './pages/stores/StoreDetails';
import ProductManagement from './pages/products/ProductManagement';
import InventoryManagement from './pages/inventory/InventoryManagement';
import SalesManagement from './pages/sales/SalesManagement';
import StaffManagement from './pages/staff/StaffManagement';
import CustomerManagement from './pages/customers/CustomerManagement';
import Reports from './pages/reports/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// Protected route component
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Toast configuration
const toastConfig = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#363636',
    color: '#fff',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <Router>
            <div className="App min-h-screen bg-neutral-50">
              <Routes>
                {/* Public authentication routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route index element={<Navigate to="/auth/login" replace />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                </Route>

                {/* Protected main application routes */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Store management routes */}
                  <Route path="stores" element={<StoreManagement />} />
                  <Route path="stores/:id" element={<StoreDetails />} />
                  
                  {/* Product management routes */}
                  <Route path="products" element={<ProductManagement />} />
                  
                  {/* Inventory management routes */}
                  <Route path="inventory" element={<InventoryManagement />} />
                  
                  {/* Sales management routes */}
                  <Route path="sales" element={<SalesManagement />} />
                  
                  {/* Staff management routes */}
                  <Route path="staff" element={<StaffManagement />} />
                  
                  {/* Customer management routes */}
                  <Route path="customers" element={<CustomerManagement />} />
                  
                  {/* Reports and analytics routes */}
                  <Route path="reports" element={<Reports />} />
                  
                  {/* Settings and profile routes */}
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Catch all route - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>

              {/* Global toast notifications */}
              <Toaster toastOptions={toastConfig} />
            </div>
          </Router>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;