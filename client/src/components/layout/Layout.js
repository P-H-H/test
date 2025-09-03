import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, Bell, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile menu button */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors duration-200"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Layout;