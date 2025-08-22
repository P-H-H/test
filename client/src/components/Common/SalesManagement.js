import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../Layout/Layout';

const SalesManagement = () => {
  const { storeId } = useParams();

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">Sales management for store {storeId} will be implemented here.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SalesManagement;