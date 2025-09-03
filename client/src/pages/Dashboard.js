import React from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  ShoppingCart, 
  Store,
  AlertTriangle,
  DollarSign,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiHelpers } from '../utils/api';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import StoreStatus from '../components/dashboard/StoreStatus';

const Dashboard = () => {
  const { user, getUserStoreId } = useAuth();
  const storeId = getUserStoreId();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery(
    ['dashboard', storeId],
    async () => {
      if (storeId) {
        const response = await apiHelpers.get(`/api/stores/${storeId}/dashboard`);
        return response.data;
      }
      return null;
    },
    {
      enabled: !!storeId,
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  // Mock data for demonstration (replace with real API calls)
  const mockStats = {
    totalSales: 12500000, // 12.5M MMK
    totalProducts: 1250,
    activeStores: 8,
    totalCustomers: 12500,
    lowStockItems: 45,
    todaySales: 850000, // 850K MMK
    monthlyGrowth: 12.5,
    customerSatisfaction: 4.2,
  };

  const stats = dashboardData?.performance || mockStats;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('my-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('my-MM').format(num);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-error-500 mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Error loading dashboard</h3>
        <p className="text-neutral-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Welcome back, {user?.firstName}! Here's what's happening with your business today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <QuickActions />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales (MMK)"
          value={formatCurrency(stats.totalSales)}
          change={stats.monthlyGrowth}
          changeType={stats.monthlyGrowth >= 0 ? 'increase' : 'decrease'}
          icon={DollarSign}
          iconColor="text-success-600"
          bgColor="bg-success-50"
        />
        
        <StatCard
          title="Total Products"
          value={formatNumber(stats.totalProducts)}
          change={5.2}
          changeType="increase"
          icon={Package}
          iconColor="text-primary-600"
          bgColor="bg-primary-50"
        />
        
        <StatCard
          title="Active Stores"
          value={stats.activeStores}
          change={0}
          changeType="neutral"
          icon={Store}
          iconColor="text-secondary-600"
          bgColor="bg-secondary-50"
        />
        
        <StatCard
          title="Total Customers"
          value={formatNumber(stats.totalCustomers)}
          change={8.1}
          changeType="increase"
          icon={Users}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Today's Sales</p>
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.todaySales)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Customer Satisfaction</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.customerSatisfaction}/5.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Store Status & Quick Actions */}
        <div className="space-y-6">
          <StoreStatus />
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Average Order Value</span>
                <span className="font-medium text-neutral-900">{formatCurrency(12500)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Orders Today</span>
                <span className="font-medium text-neutral-900">68</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">New Customers</span>
                <span className="font-medium text-neutral-900">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Staff on Duty</span>
                <span className="font-medium text-neutral-900">24</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Myanmar Market Insights */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">🇲🇲 Myanmar Market Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-600 mb-2">
              <strong>Local Currency:</strong> Myanmar Kyat (MMK) - {formatCurrency(1000)} = $0.48 USD
            </p>
            <p className="text-neutral-600 mb-2">
              <strong>Business Hours:</strong> Most stores operate 9 AM - 9 PM local time
            </p>
          </div>
          <div>
            <p className="text-neutral-600 mb-2">
              <strong>Peak Shopping:</strong> Weekends and evenings (6 PM - 8 PM)
            </p>
            <p className="text-neutral-600 mb-2">
              <strong>Popular Categories:</strong> Fresh produce, household items, personal care
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;