import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Outlet />
    </div>
  );
};

export default AuthLayout;