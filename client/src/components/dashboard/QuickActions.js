import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart, Package, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const QuickActions = () => {
  const { hasPermission } = useAuth();

  const actions = [
    {
      name: 'New Sale',
      href: '/sales/new',
      icon: ShoppingCart,
      color: 'bg-success-600 hover:bg-success-700',
      permission: 'manage_sales',
    },
    {
      name: 'Add Product',
      href: '/products/new',
      icon: Package,
      color: 'bg-primary-600 hover:bg-primary-700',
      permission: 'manage_products',
    },
    {
      name: 'Add Staff',
      href: '/staff/new',
      icon: Users,
      color: 'bg-secondary-600 hover:bg-secondary-700',
      permission: 'manage_staff',
    },
    {
      name: 'View Reports',
      href: '/reports',
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700',
      permission: 'view_reports',
    },
  ];

  const filteredActions = actions.filter(action => {
    if (!action.permission) return true;
    return hasPermission(action.permission);
  });

  return (
    <div className="flex flex-wrap gap-2">
      {filteredActions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.name}
            to={action.href}
            className={`
              inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg
              text-white ${action.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              transition-all duration-200 transform hover:scale-105 active:scale-95
              shadow-md hover:shadow-lg
            `}
          >
            <Icon className="w-4 h-4 mr-2" />
            {action.name}
          </Link>
        );
      })}
      
      {/* Quick Add Button */}
      <button
        className="
          inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-lg
          text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200
          transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg
        "
      >
        <Plus className="w-4 h-4 mr-2" />
        Quick Add
      </button>
    </div>
  );
};

export default QuickActions;