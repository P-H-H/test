import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../Layout/Layout';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Store,
  UserCheck,
  UserX,
  X,
  Search
} from 'lucide-react';

const EmployeeManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    assignedStores: []
  });

  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await axios.get(`/api/users/employees?${params}`);
      return response.data;
    },
  });

  // Fetch stores for assignment
  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await axios.get('/api/stores');
      return response.data;
    },
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData) => {
      const response = await axios.post('/api/users/employees', employeeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      toast.success('Employee created successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    },
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, ...employeeData }) => {
      const response = await axios.put(`/api/users/employees/${id}`, employeeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      toast.success('Employee updated successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId) => {
      await axios.delete(`/api/users/employees/${employeeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      toast.success('Employee deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    },
  });

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        password: '',
        phone: employee.phone,
        assignedStores: employee.assignedStores?.map(store => store._id) || []
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        assignedStores: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStoreSelection = (storeId) => {
    setFormData(prev => ({
      ...prev,
      assignedStores: prev.assignedStores.includes(storeId)
        ? prev.assignedStores.filter(id => id !== storeId)
        : [...prev.assignedStores, storeId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    // Don't send password if it's empty during edit
    if (editingEmployee && !submitData.password) {
      delete submitData.password;
    }
    
    if (editingEmployee) {
      updateEmployeeMutation.mutate({ id: editingEmployee._id, ...submitData });
    } else {
      createEmployeeMutation.mutate(submitData);
    }
  };

  const handleDelete = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      deleteEmployeeMutation.mutate(employeeId);
    }
  };

  const employees = employeesData?.employees || [];

  if (employeesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Employee Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your employees and their store assignments
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Employee
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Employees</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Employees Grid */}
          <div className="mt-8">
            {employees && employees.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <li key={employee._id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-indigo-600 truncate">
                                  {employee.name}
                                </p>
                                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  employee.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {employee.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="mt-2 flex">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                  {employee.email}
                                </div>
                                <div className="ml-6 flex items-center text-sm text-gray-500">
                                  <Phone className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                  {employee.phone}
                                </div>
                              </div>
                              {employee.assignedStores && employee.assignedStores.length > 0 && (
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <Store className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                  <span>
                                    Assigned to: {employee.assignedStores.map(store => store.name).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenModal(employee)}
                              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(employee._id)}
                              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employees</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new employee.</p>
                <div className="mt-6">
                  <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Add Employee
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                        </h3>
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-4">
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                              type="text"
                              name="name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                              type="tel"
                              name="phone"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Phone number"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Email address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {editingEmployee ? 'New Password (leave blank to keep current)' : 'Password'}
                          </label>
                          <input
                            type="password"
                            name="password"
                            required={!editingEmployee}
                            value={formData.password}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Password"
                            minLength={6}
                          />
                        </div>

                        {/* Store Assignment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign to Stores
                          </label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {stores?.map((store) => (
                              <label key={store._id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.assignedStores.includes(store._id)}
                                  onChange={() => handleStoreSelection(store._id)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {store.name} ({store.address.city})
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={createEmployeeMutation.isLoading || updateEmployeeMutation.isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {createEmployeeMutation.isLoading || updateEmployeeMutation.isLoading
                      ? 'Saving...'
                      : editingEmployee
                      ? 'Update Employee'
                      : 'Create Employee'
                    }
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EmployeeManagement;