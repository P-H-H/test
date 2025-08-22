import React from 'react';

const Products: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button className="btn-primary">
          Add New Product
        </button>
      </div>

      <div className="card">
        <p className="text-gray-600">Product management interface will be implemented here.</p>
      </div>
    </div>
  );
};

export default Products;