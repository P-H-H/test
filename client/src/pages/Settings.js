import React, { useState } from 'react';
import { Settings as SettingsIcon, Store, User, Shield, Bell, Globe, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'stores', name: 'Store Settings', icon: Store },
    { id: 'users', name: 'User Management', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'localization', name: 'Localization', icon: Globe },
    { id: 'backup', name: 'Backup & Restore', icon: Database }
  ];

  const handleSave = (section) => {
    toast.success(`${section} settings saved successfully`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your system configuration and preferences</p>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <GeneralSettings onSave={() => handleSave('General')} />
          )}
          {activeTab === 'stores' && (
            <StoreSettings onSave={() => handleSave('Store')} />
          )}
          {activeTab === 'users' && (
            <UserSettings onSave={() => handleSave('User')} />
          )}
          {activeTab === 'security' && (
            <SecuritySettings onSave={() => handleSave('Security')} />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettings onSave={() => handleSave('Notification')} />
          )}
          {activeTab === 'localization' && (
            <LocalizationSettings onSave={() => handleSave('Localization')} />
          )}
          {activeTab === 'backup' && (
            <BackupSettings onSave={() => handleSave('Backup')} />
          )}
        </div>
      </div>
    </div>
  );
};

// General Settings Component
const GeneralSettings = ({ onSave }) => {
  const [settings, setSettings] = useState({
    companyName: 'Myanmar Supermarket Management System',
    systemEmail: 'admin@myanmarsupermarket.com',
    timezone: 'Asia/Yangon',
    dateFormat: 'DD/MM/YYYY',
    currency: 'MMK'
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">System Email</label>
            <input
              type="email"
              value={settings.systemEmail}
              onChange={(e) => setSettings({ ...settings, systemEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Asia/Yangon">Asia/Yangon (UTC+6:30)</option>
              <option value="UTC">UTC (UTC+0)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="MMK">Myanmar Kyat (MMK)</option>
              <option value="USD">US Dollar (USD)</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={onSave}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Store Settings Component
const StoreSettings = ({ onSave }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Store Settings</h3>
        <p className="text-gray-600">Store-specific configuration settings will be implemented here.</p>
        <div className="mt-6">
          <button
            onClick={onSave}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// User Settings Component
const UserSettings = ({ onSave }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
        <p className="text-gray-600">User management and permission settings will be implemented here.</p>
        <div className="mt-6">
          <button
            onClick={onSave}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings = ({ onSave }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        <p className="text-gray-600">Security and authentication settings will be implemented here.</p>
        <div className="mt-6">
          <button
            onClick={onSave}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = ({ onSave }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
        <p className="text-gray-600">Email and system notification preferences will be implemented here.</p>
        <div className="mt-6">
          <button
            onClick={onSave}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Localization Settings Component
const LocalizationSettings = ({ onSave }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Localization Settings</h3>
        <p className="text-gray-600">Language and regional settings will be implemented here.</p>
        <div className="mt-6">
          <button
            onClick={onSave}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Backup Settings Component
const BackupSettings = ({ onSave }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Backup & Restore</h3>
        <p className="text-gray-600">Database backup and restore functionality will be implemented here.</p>
        <div className="mt-6">
          <button
            onClick={onSave}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;