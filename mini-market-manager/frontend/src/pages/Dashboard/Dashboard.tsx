import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Sales',
      value: '$12,345',
      change: '+12%',
      changeType: 'increase',
      icon: DollarSign,
    },
    {
      name: 'Orders',
      value: '156',
      change: '+8%',
      changeType: 'increase',
      icon: ShoppingCart,
    },
    {
      name: 'Products',
      value: '1,234',
      change: '+3%',
      changeType: 'increase',
      icon: Package,
    },
    {
      name: 'Low Stock Items',
      value: '23',
      change: '-2%',
      changeType: 'decrease',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your {user?.role === 'owner' ? 'stores' : 'store'} today.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-success-600' : 'text-error-600'
                      }`}>
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                        <span className="ml-1">{stat.change}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left">
              Process New Sale
            </button>
            <button className="w-full btn-secondary text-left">
              Add New Product
            </button>
            <button className="w-full btn-secondary text-left">
              Update Inventory
            </button>
            {user?.role === 'owner' && (
              <button className="w-full btn-secondary text-left">
                View All Stores
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Sale #1234</p>
                <p className="text-sm text-gray-500">2 minutes ago</p>
              </div>
              <span className="text-sm font-medium text-success-600">$45.99</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Inventory Update</p>
                <p className="text-sm text-gray-500">15 minutes ago</p>
              </div>
              <span className="text-sm text-gray-500">+50 units</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Low Stock Alert</p>
                <p className="text-sm text-gray-500">1 hour ago</p>
              </div>
              <span className="text-sm font-medium text-warning-600">3 items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Sales chart will be implemented here</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Top products chart will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;