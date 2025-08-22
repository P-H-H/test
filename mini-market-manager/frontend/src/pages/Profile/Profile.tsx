import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={user?.firstName || ''}
                className="input-field mt-1"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={user?.lastName || ''}
                className="input-field mt-1"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="input-field mt-1"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                value={user?.role || ''}
                className="input-field mt-1 capitalize"
                readOnly
              />
            </div>
          </div>
          <div className="mt-6">
            <button className="btn-primary">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                className="input-field mt-1"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                className="input-field mt-1"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                className="input-field mt-1"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="mt-6">
            <button className="btn-primary">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;