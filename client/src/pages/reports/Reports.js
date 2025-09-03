import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  Download,
  Filter,
  Eye,
  FileText,
  PieChart,
  Activity,
  ShoppingCart,
  Store,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('dashboard');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedStore, setSelectedStore] = useState('all');

  useEffect(() => {
    // Simulate loading reports
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleExportReport = (reportType) => {
    toast.info(`${reportType} report export will be implemented next`);
  };

  const handleViewReport = (reportType) => {
    toast.info(`Viewing ${reportType} report`);
  };

  const getDateRangeText = (range) => {
    switch (range) {
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      case '90d':
        return 'Last 90 Days';
      case '1y':
        return 'Last Year';
      case 'ytd':
        return 'Year to Date';
      default:
        return 'Last 30 Days';
    }
  };

  const getStoreName = (storeId) => {
    if (storeId === 'all') return 'All Stores';
    const stores = {
      'store1': 'Yangon Central Store',
      'store2': 'Mandalay Store',
      'store3': 'Naypyidaw Store'
    };
    return stores[storeId] || storeId;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your supermarket operations and performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="ytd">Year to Date</option>
          </select>
          
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Stores</option>
            <option value="store1">Yangon Central Store</option>
            <option value="store2">Mandalay Store</option>
            <option value="store3">Naypyidaw Store</option>
          </select>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'dashboard', name: 'Dashboard Overview', icon: BarChart3 },
              { id: 'sales', name: 'Sales Performance', icon: TrendingUp },
              { id: 'inventory', name: 'Inventory Health', icon: Package },
              { id: 'customers', name: 'Customer Insights', icon: Users },
              { id: 'staff', name: 'Staff Performance', icon: Star },
              { id: 'financial', name: 'Financial Reports', icon: DollarSign },
              { id: 'myanmar', name: 'Myanmar Market', icon: Store }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    selectedReport === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {selectedReport === 'dashboard' && (
            <DashboardOverview dateRange={dateRange} selectedStore={selectedStore} />
          )}
          {selectedReport === 'sales' && (
            <SalesPerformance dateRange={dateRange} selectedStore={selectedStore} />
          )}
          {selectedReport === 'inventory' && (
            <InventoryHealth dateRange={dateRange} selectedStore={selectedStore} />
          )}
          {selectedReport === 'customers' && (
            <CustomerInsights dateRange={dateRange} selectedStore={selectedStore} />
          )}
          {selectedReport === 'staff' && (
            <StaffPerformance dateRange={dateRange} selectedStore={selectedStore} />
          )}
          {selectedReport === 'financial' && (
            <FinancialReports dateRange={dateRange} selectedStore={selectedStore} />
          )}
          {selectedReport === 'myanmar' && (
            <MyanmarMarket dateRange={dateRange} selectedStore={selectedStore} />
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ dateRange, selectedStore }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Dashboard Overview - {getDateRangeText(dateRange)} - {getStoreName(selectedStore)}
        </h2>
        <button
          onClick={() => handleExportReport('Dashboard Overview')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">₿ 45,678,900</p>
              <p className="text-sm text-green-600">+12.5% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-semibold text-gray-900">1,234</p>
              <p className="text-sm text-green-600">+8.3% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Customers</p>
              <p className="text-2xl font-semibold text-gray-900">89</p>
              <p className="text-sm text-green-600">+15.2% from last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-semibold text-gray-900">23</p>
              <p className="text-sm text-red-600">+5 items from last period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue trend chart will be implemented</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Top products chart will be implemented</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { type: 'sale', message: 'Large order completed - ₿ 125,000', time: '2 hours ago', icon: CheckCircle, color: 'text-green-600' },
            { type: 'inventory', message: 'Low stock alert for rice products', time: '4 hours ago', icon: AlertTriangle, color: 'text-yellow-600' },
            { type: 'customer', message: 'New customer registered - U Aung Kyaw', time: '6 hours ago', icon: Users, color: 'text-blue-600' },
            { type: 'staff', message: 'Staff performance review completed', time: '1 day ago', icon: Star, color: 'text-purple-600' }
          ].map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Icon className={`w-5 h-5 ${activity.color}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Sales Performance Component
const SalesPerformance = ({ dateRange, selectedStore }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Sales Performance - {getDateRangeText(dateRange)} - {getStoreName(selectedStore)}
        </h2>
        <button
          onClick={() => handleExportReport('Sales Performance')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Sales</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Daily sales chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Category breakdown</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Products</h3>
          <div className="space-y-3">
            {[
              { name: 'Jasmine Rice', sales: '₿ 2,450,000', growth: '+15%' },
              { name: 'Fresh Vegetables', sales: '₿ 1,890,000', growth: '+8%' },
              { name: 'Cooking Oil', sales: '₿ 1,650,000', growth: '+12%' },
              { name: 'Instant Noodles', sales: '₿ 1,320,000', growth: '+5%' }
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-900">{product.name}</span>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{product.sales}</p>
                  <p className="text-xs text-green-600">{product.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Inventory Health Component
const InventoryHealth = ({ dateRange, selectedStore }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Inventory Health - {getDateRangeText(dateRange)} - {getStoreName(selectedStore)}
        </h2>
        <button
          onClick={() => handleExportReport('Inventory Health')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Inventory Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Levels</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Stock levels chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Low Stock Alerts</h3>
          <div className="space-y-3">
            {[
              { item: 'Jasmine Rice', current: 50, min: 100, status: 'critical' },
              { item: 'Cooking Oil', current: 75, min: 80, status: 'warning' },
              { item: 'Fresh Tomatoes', current: 20, min: 50, status: 'critical' },
              { item: 'Instant Noodles', current: 120, min: 100, status: 'normal' }
            ].map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                alert.status === 'critical' ? 'bg-red-50 border border-red-200' :
                alert.status === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{alert.item}</span>
                  <span className={`text-sm font-medium ${
                    alert.status === 'critical' ? 'text-red-600' :
                    alert.status === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {alert.current}/{alert.min}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Customer Insights Component
const CustomerInsights = ({ dateRange, selectedStore }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Customer Insights - {getDateRangeText(dateRange)} - {getStoreName(selectedStore)}
        </h2>
        <button
          onClick={() => handleExportReport('Customer Insights')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Demographics</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Demographics chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Loyalty Program Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Total Members</span>
              <span className="text-lg font-semibold text-gray-900">2,450</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Gold Members</span>
              <span className="text-lg font-semibold text-gray-900">156</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Silver Members</span>
              <span className="text-lg font-semibold text-gray-900">389</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Bronze Members</span>
              <span className="text-lg font-semibold text-gray-900">1,905</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Staff Performance Component
const StaffPerformance = ({ dateRange, selectedStore }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Staff Performance - {getDateRangeText(dateRange)} - {getStoreName(selectedStore)}
        </h2>
        <button
          onClick={() => handleExportReport('Staff Performance')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Staff Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Ratings</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Performance ratings chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {[
              { name: 'U Aung Kyaw', position: 'Store Manager', rating: 4.9, sales: '₿ 8,450,000' },
              { name: 'Daw Hla Hla', position: 'Cashier', rating: 4.8, sales: '₿ 6,230,000' },
              { name: 'U Min Min', position: 'Sales Associate', rating: 4.7, sales: '₿ 5,890,000' },
              { name: 'Daw Su Su', position: 'Inventory Manager', rating: 4.6, sales: '₿ 4,120,000' }
            ].map((staff, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                  <p className="text-xs text-gray-500">{staff.position}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{staff.sales}</p>
                  <p className="text-xs text-blue-600">Rating: {staff.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Financial Reports Component
const FinancialReports = ({ dateRange, selectedStore }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Financial Reports - {getDateRangeText(dateRange)} - {getStoreName(selectedStore)}
        </h2>
        <button
          onClick={() => handleExportReport('Financial Reports')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profit & Loss</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">P&L statement chart</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cash Flow</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Cash flow chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Myanmar Market Component
const MyanmarMarket = ({ dateRange, selectedStore }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Myanmar Market Insights - {getDateRangeText(dateRange)} - {getStoreName(selectedStore)}
        </h2>
        <button
          onClick={() => handleExportReport('Myanmar Market')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Myanmar Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Local Product Performance</h3>
          <div className="space-y-3">
            {[
              { product: 'Myanmar Rice', sales: '₿ 3,450,000', growth: '+25%', local: true },
              { product: 'Tea Leaf', sales: '₿ 1,890,000', growth: '+18%', local: true },
              { product: 'Pulses', sales: '₿ 2,120,000', growth: '+22%', local: true },
              { product: 'Fresh Herbs', sales: '₿ 980,000', growth: '+15%', local: true }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{item.product}</span>
                  {item.local && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Local
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{item.sales}</p>
                  <p className="text-xs text-green-600">{item.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cultural Trends</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Festival Season Impact</h4>
              <p className="text-sm text-blue-700">Increased sales during Thingyan, Thadingyut, and Tazaungdaing festivals</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Local Preferences</h4>
              <p className="text-sm text-green-700">Strong demand for traditional Myanmar ingredients and cooking essentials</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="text-sm font-medium text-purple-900 mb-2">Seasonal Patterns</h4>
              <p className="text-sm text-purple-700">Peak sales during monsoon season for preserved foods and dry goods</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;