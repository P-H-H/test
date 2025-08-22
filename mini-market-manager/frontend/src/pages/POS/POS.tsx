import React from 'react';

const POS: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <p className="text-gray-600">Product scanning and cart interface will be implemented here.</p>
          </div>
        </div>

        <div className="card">
          <p className="text-gray-600">Cart summary and payment interface will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default POS;