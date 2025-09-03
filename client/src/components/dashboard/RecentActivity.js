import React from 'react';
import { Clock, ShoppingCart, Package, Users, DollarSign, AlertTriangle } from 'lucide-react';

const RecentActivity = () => {
  // Mock data for recent activity
  const activities = [
    {
      id: 1,
      type: 'sale',
      title: 'New sale completed',
      description: 'Sale #INV-001 for 125,000 MMK',
      time: '2 minutes ago',
      amount: 125000,
      icon: ShoppingCart,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      id: 2,
      type: 'product',
      title: 'Product added',
      description: 'Fresh tomatoes added to inventory',
      time: '15 minutes ago',
      icon: Package,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      id: 3,
      type: 'staff',
      title: 'Staff member logged in',
      description: 'Aung Myo logged in to system',
      time: '1 hour ago',
      icon: Users,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      id: 4,
      type: 'alert',
      title: 'Low stock alert',
      description: 'Rice stock is running low (5 bags remaining)',
      time: '2 hours ago',
      icon: AlertTriangle,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      id: 5,
      type: 'sale',
      title: 'Large sale completed',
      description: 'Sale #INV-002 for 450,000 MMK',
      time: '3 hours ago',
      amount: 450000,
      icon: ShoppingCart,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      id: 6,
      type: 'product',
      title: 'Inventory updated',
      description: 'Milk stock updated to 50 units',
      time: '4 hours ago',
      icon: Package,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('my-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (activity) => {
    const Icon = activity.icon;
    return (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.bgColor}`}>
        <Icon className={`w-4 h-4 ${activity.color}`} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-900">Recent Activity</h3>
        <p className="text-sm text-neutral-600">Latest updates from your stores</p>
      </div>
      
      <div className="divide-y divide-neutral-200">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4 hover:bg-neutral-50 transition-colors duration-150">
            <div className="flex items-start space-x-3">
              {getActivityIcon(activity)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-900">{activity.title}</p>
                  <div className="flex items-center text-xs text-neutral-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
                
                <p className="text-sm text-neutral-600 mt-1">{activity.description}</p>
                
                {activity.amount && (
                  <div className="flex items-center mt-2">
                    <DollarSign className="w-4 h-4 text-success-600 mr-1" />
                    <span className="text-sm font-medium text-success-600">
                      {formatCurrency(activity.amount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-6 py-4 border-t border-neutral-200">
        <button className="w-full text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;