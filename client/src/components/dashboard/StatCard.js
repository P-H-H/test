import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconColor, 
  bgColor 
}) => {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-success-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-error-600" />;
      default:
        return <Minus className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-success-600';
      case 'decrease':
        return 'text-error-600';
      default:
        return 'text-neutral-500';
    }
  };

  const getChangeText = () => {
    if (changeType === 'neutral') return 'No change';
    return `${change > 0 ? '+' : ''}${change}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', bgColor)}>
            <Icon className={cn('w-6 h-6', iconColor)} />
          </div>
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-600 truncate">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
        </div>
      </div>
      
      {/* Change indicator */}
      <div className="mt-4 flex items-center">
        {getChangeIcon()}
        <span className={cn('ml-2 text-sm font-medium', getChangeColor())}>
          {getChangeText()}
        </span>
        <span className="ml-2 text-xs text-neutral-500">from last month</span>
      </div>
    </div>
  );
};

export default StatCard;