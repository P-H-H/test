import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout/Layout';
import { 
  Store, 
  Users, 
  Package, 
  BarChart3, 
  Plus, 
  Eye,
  DollarSign,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';

const OwnerDashboard = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/users/dashboard-stats');
      return response.data;
    },
  });

  // Fetch stores
  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await axios.get('/api/stores');
      return response.data;
    },
  });

  const StatCard = ({ title, value, icon: Icon, color, change, link }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                    <span className="ml-1">{Math.abs(change)}%</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {link && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link to={link} className="font-medium text-indigo-700 hover:text-indigo-900">
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, link, color }) => (
    <Link 
      to={link}
      className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div>
        <span className={`rounded-lg inline-flex p-3 ${color} ring-4 ring-white`}>
          <Icon className="h-6 w-6 text-white" />
        </span>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      </div>
      <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
        <Plus className="h-6 w-6" />
      </span>
    </Link>
  );

  if (statsLoading || storesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Page header */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Dashboard Overview
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back! Here's what's happening with your stores.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Stores"
                value={stats?.totalStores || 0}
                icon={Store}
                color="text-blue-600"
                link="/stores"
              />
              <StatCard
                title="Active Employees"
                value={stats?.activeEmployees || 0}
                icon={Users}
                color="text-green-600"
                link="/employees"
              />
              <StatCard
                title="Total Products"
                value="0" // You can add this to your stats API
                icon={Package}
                color="text-purple-600"
                link="/products"
              />
              <StatCard
                title="Monthly Revenue"
                value="$0" // You can add this to your stats API
                icon={DollarSign}
                color="text-yellow-600"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <QuickActionCard
                title="Add New Store"
                description="Set up a new store location and assign employees"
                icon={Store}
                link="/stores"
                color="bg-blue-500"
              />
              <QuickActionCard
                title="Add Employee"
                description="Register a new employee and assign them to stores"
                icon={Users}
                link="/employees"
                color="bg-green-500"
              />
              <QuickActionCard
                title="Add Product"
                description="Add new products to your inventory catalog"
                icon={Package}
                link="/products"
                color="bg-purple-500"
              />
            </div>
          </div>

          {/* Recent Stores */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Your Stores</h3>
                  <Link 
                    to="/stores" 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all
                  </Link>
                </div>
                
                {stores && stores.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stores.slice(0, 6).map((store) => (
                      <div key={store._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{store.name}</h4>
                            <p className="text-sm text-gray-500">
                              {store.address.city}, {store.address.state}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {store.employees?.length || 0} employees
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              to={`/inventory/${store._id}`}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <Package className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/pos/${store._id}`}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Store className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No stores</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new store.</p>
                    <div className="mt-6">
                      <Link
                        to="/stores"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Add Store
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Employees */}
          {stats?.recentEmployees && stats.recentEmployees.length > 0 && (
            <div className="mt-8">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Employees</h3>
                    <Link 
                      to="/employees" 
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View all
                    </Link>
                  </div>
                  
                  <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {stats.recentEmployees.map((employee) => (
                        <li key={employee._id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {employee.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {employee.email}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                employee.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {employee.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OwnerDashboard;