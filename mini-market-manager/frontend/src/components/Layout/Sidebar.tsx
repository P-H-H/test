import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  X, 
  Home, 
  Store, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    ...(user?.role === 'owner' ? [
      { name: 'Stores', href: '/stores', icon: Store, current: location.pathname === '/stores' }
    ] : []),
    { name: 'Products', href: '/products', icon: Package, current: location.pathname === '/products' },
    { name: 'Sales', href: '/sales', icon: ShoppingCart, current: location.pathname === '/sales' },
    { name: 'POS', href: '/pos', icon: CreditCard, current: location.pathname === '/pos' },
    { name: 'Reports', href: '/reports', icon: BarChart3, current: location.pathname === '/reports' },
  ];

  const secondaryNavigation = [
    { name: 'Profile', href: '/profile', icon: User, current: location.pathname === '/profile' },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Store className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">MiniMarket</span>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          {user?.assignedStore && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {user.assignedStore.name}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  sidebar-item
                  ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Secondary navigation */}
        <div className="border-t border-gray-200 px-4 py-4">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  sidebar-item
                  ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;