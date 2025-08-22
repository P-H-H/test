import React, { useState } from 'react';
import { Menu, Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar */}
          <div className="hidden md:block ml-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products, sales..."
                className="w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="text-gray-400 hover:text-gray-600 relative">
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-error-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <span className="hidden md:block font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </button>

            {/* User dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    navigate('/profile');
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <UserIcon className="mr-3 h-4 w-4" />
                  Profile Settings
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-6 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products, sales..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;