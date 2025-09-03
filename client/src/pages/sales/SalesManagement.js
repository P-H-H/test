import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Receipt,
  CreditCard,
  Cash,
  Star,
  Calendar,
  MapPin,
  Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Simulate loading sales
    setTimeout(() => {
      setSales([
        {
          id: 1,
          saleNumber: 'SALE-001234',
          customerName: 'Hla Hla',
          customerPhone: '09-12345678',
          storeName: 'Yangon Central Store',
          items: [
            { name: 'Organic Rice', quantity: 2, unitPrice: 2500, total: 5000 },
            { name: 'Fresh Tomatoes', quantity: 1, unitPrice: 800, total: 800 }
          ],
          totalItems: 3,
          subtotal: 5800,
          tax: 290,
          discount: 0,
          total: 6090,
          currency: 'MMK',
          paymentMethod: 'cash',
          paymentStatus: 'paid',
          status: 'completed',
          createdAt: '2024-01-20T10:30:00Z',
          cashier: 'Min Min',
          notes: 'Customer requested paper bag'
        },
        {
          id: 2,
          saleNumber: 'SALE-001235',
          customerName: 'Aung Kyaw',
          customerPhone: '09-23456789',
          storeName: 'Mandalay Store',
          items: [
            { name: 'Chicken Breast', quantity: 1, unitPrice: 4500, total: 4500 },
            { name: 'Cooking Oil', quantity: 2, unitPrice: 1800, total: 3600 }
          ],
          totalItems: 3,
          subtotal: 8100,
          tax: 405,
          discount: 200,
          total: 8305,
          currency: 'MMK',
          paymentMethod: 'mobile_money',
          paymentStatus: 'paid',
          status: 'completed',
          createdAt: '2024-01-20T11:15:00Z',
          cashier: 'Su Su',
          notes: 'Mobile money payment - KBZ Pay'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleNewSale = () => {
    toast.info('New sale form will be implemented next');
  };

  const handleViewSale = (sale) => {
    toast.info(`View sale: ${sale.saleNumber}`);
  };

  const handleEditSale = (sale) => {
    toast.info(`Edit sale: ${sale.saleNumber}`);
  };

  const handleRefundSale = (sale) => {
    toast.info(`Refund sale: ${sale.saleNumber}`);
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'mobile_money':
        return 'Mobile Money';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price, currency) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const completedSales = sales.filter(s => s.status === 'completed').length;
  const averageOrderValue = totalRevenue / totalSales;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Track sales, manage transactions, and monitor revenue</p>
        </div>
        
        <button
          onClick={handleNewSale}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Sale
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-semibold text-gray-900">{totalSales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(totalRevenue, 'MMK')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Sales</p>
              <p className="text-2xl font-semibold text-gray-900">{completedSales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(averageOrderValue, 'MMK')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleNewSale}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">New Sale</p>
              <p className="text-xs text-gray-500">Create new transaction</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('POS terminal will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">POS Terminal</p>
              <p className="text-xs text-gray-500">Point of sale system</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Reports will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Sales Reports</p>
              <p className="text-xs text-gray-500">Generate reports</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Refunds will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Refunds</p>
              <p className="text-xs text-gray-500">Process refunds</p>
            </div>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sales by sale number, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="lg:w-48">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? "bg-primary-100 text-primary-600" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' 
                  ? "bg-primary-100 text-primary-600" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'grid' ? (
          <div className="p-6">
            {filteredSales.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first sale'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && paymentFilter === 'all' && (
                  <button
                    onClick={handleNewSale}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Sale
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{sale.saleNumber}</h3>
                          <p className="text-sm text-gray-500 mb-2">{sale.storeName}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                              {getStatusText(sale.status)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(sale.paymentStatus)}`}>
                              {sale.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Customer Info */}
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="text-sm font-medium text-gray-900">{sale.customerName}</p>
                        <p className="text-sm text-gray-500">{sale.customerPhone}</p>
                      </div>

                      {/* Items */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-2">Items ({sale.totalItems})</p>
                        <div className="space-y-1">
                          {sale.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-900">{item.name} x{item.quantity}</span>
                              <span className="text-gray-600">{formatPrice(item.total, sale.currency)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-900">{formatPrice(sale.subtotal, sale.currency)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax:</span>
                            <span className="text-gray-900">{formatPrice(sale.tax, sale.currency)}</span>
                          </div>
                          {sale.discount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Discount:</span>
                              <span className="text-green-600">-{formatPrice(sale.discount, sale.currency)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-medium pt-1 border-t border-gray-100">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-lg text-gray-900">{formatPrice(sale.total, sale.currency)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Payment Method:</span>
                          <span className="text-sm text-gray-900">{getPaymentMethodText(sale.paymentMethod)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Cashier:</span>
                          <span className="text-sm text-gray-900">{sale.cashier}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {sale.notes && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="text-sm text-gray-900">{sale.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {formatDate(sale.createdAt)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewSale(sale)}
                            className="px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditSale(sale)}
                            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleRefundSale(sale)}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            Refund
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items & Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{sale.saleNumber}</div>
                          <div className="text-sm text-gray-500">{formatDate(sale.createdAt)}</div>
                          <div className="text-sm text-gray-500">Cashier: {sale.cashier}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.customerName}</div>
                      <div className="text-sm text-gray-500">{sale.customerPhone}</div>
                      <div className="text-sm text-gray-500">{sale.storeName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.totalItems} items</div>
                      <div className="text-sm text-gray-500">
                        {sale.items.map(item => item.name).join(', ')}
                      </div>
                      <div className="text-lg font-medium text-gray-900 mt-1">
                        {formatPrice(sale.total, sale.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getPaymentMethodText(sale.paymentMethod)}</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                        {getStatusText(sale.status)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(sale.paymentStatus)} ml-2`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSale(sale)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                          title="View Sale"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSale(sale)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                          title="Edit Sale"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRefundSale(sale)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Refund Sale"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSales.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
                <p className="text-gray-600">No sales match your current filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesManagement;