import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = 'Loading...',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    gray: 'text-gray-600'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`}></div>
      {text && (
        <p className="mt-3 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;