import React from 'react';

const Sales: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
        <button className="btn-primary">
          Export Sales Report
        </button>
      </div>

      <div className="card">
        <p className="text-gray-600">Sales management interface will be implemented here.</p>
      </div>
    </div>
  );
};

export default Sales;