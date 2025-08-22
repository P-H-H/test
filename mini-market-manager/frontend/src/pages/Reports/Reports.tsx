import React from 'react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <button className="btn-primary">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Reports</h3>
          <p className="text-gray-600">Sales analytics and reports will be implemented here.</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Reports</h3>
          <p className="text-gray-600">Inventory analytics and reports will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;