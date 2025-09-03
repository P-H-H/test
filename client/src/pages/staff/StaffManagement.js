import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Star, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Award,
  Calendar,
  MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    // Simulate loading staff
    setTimeout(() => {
      setStaff([
        {
          id: 1,
          employeeId: 'EMP-001234',
          firstName: 'Hla',
          lastName: 'Hla',
          firstNameMyanmar: 'လှ',
          lastNameMyanmar: 'လှ',
          position: 'store_manager',
          department: 'management',
          storeName: 'Yangon Central Store',
          hireDate: '2023-01-15',
          salary: 800000,
          currency: 'MMK',
          rating: 4.8,
          totalDaysWorked: 280,
          totalHoursWorked: 2240,
          overtimeHours: 120,
          status: 'active',
          phone: '09-12345678',
          email: 'hla.hla@example.com'
        },
        {
          id: 2,
          employeeId: 'EMP-001235',
          firstName: 'Min',
          lastName: 'Min',
          firstNameMyanmar: 'မင်း',
          lastNameMyanmar: 'မင်း',
          position: 'cashier',
          department: 'sales',
          storeName: 'Mandalay Store',
          hireDate: '2023-03-20',
          salary: 450000,
          currency: 'MMK',
          rating: 4.2,
          totalDaysWorked: 250,
          totalHoursWorked: 2000,
          overtimeHours: 80,
          status: 'active',
          phone: '09-23456789',
          email: 'min.min@example.com'
        },
        {
          id: 3,
          employeeId: 'EMP-001236',
          firstName: 'Su',
          lastName: 'Su',
          firstNameMyanmar: 'စု',
          lastNameMyanmar: 'စု',
          position: 'inventory_manager',
          department: 'inventory',
          storeName: 'Yangon Central Store',
          hireDate: '2023-06-10',
          salary: 600000,
          currency: 'MMK',
          rating: 4.5,
          totalDaysWorked: 200,
          totalHoursWorked: 1600,
          overtimeHours: 60,
          status: 'active',
          phone: '09-34567890',
          email: 'su.su@example.com'
        },
        {
          id: 4,
          employeeId: 'EMP-001237',
          firstName: 'Aung',
          lastName: 'Kyaw',
          firstNameMyanmar: 'အောင်',
          lastNameMyanmar: 'ကျော်',
          position: 'security_guard',
          department: 'security',
          storeName: 'Mandalay Store',
          hireDate: '2023-08-05',
          salary: 350000,
          currency: 'MMK',
          rating: 4.0,
          totalDaysWorked: 150,
          totalHoursWorked: 1200,
          overtimeHours: 40,
          status: 'active',
          phone: '09-45678901',
          email: 'aung.kyaw@example.com'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddStaff = () => {
    toast.info('Add staff form will be implemented next');
  };

  const handleViewStaff = (staffMember) => {
    toast.info(`View staff: ${staffMember.firstName} ${staffMember.lastName}`);
  };

  const handleEditStaff = (staffMember) => {
    toast.info(`Edit staff: ${staffMember.firstName} ${staffMember.lastName}`);
  };

  const handlePerformanceReview = (staffMember) => {
    toast.info(`Performance review for: ${staffMember.firstName} ${staffMember.lastName}`);
  };

  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'all' || staffMember.position === positionFilter;
    const matchesStatus = statusFilter === 'all' || staffMember.status === statusFilter;
    
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const getPositionText = (position) => {
    const positions = {
      store_manager: 'Store Manager',
      assistant_manager: 'Assistant Manager',
      cashier: 'Cashier',
      inventory_manager: 'Inventory Manager',
      sales_associate: 'Sales Associate',
      security_guard: 'Security Guard',
      cleaner: 'Cleaner',
      delivery_driver: 'Delivery Driver',
      warehouse_worker: 'Warehouse Worker',
      customer_service: 'Customer Service',
      supervisor: 'Supervisor',
      trainee: 'Trainee'
    };
    return positions[position] || position;
  };

  const getDepartmentText = (department) => {
    const departments = {
      management: 'Management',
      sales: 'Sales',
      inventory: 'Inventory',
      customer_service: 'Customer Service',
      security: 'Security',
      maintenance: 'Maintenance',
      logistics: 'Logistics',
      administration: 'Administration'
    };
    return departments[department] || department;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'resigned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'suspended':
        return 'Suspended';
      case 'terminated':
        return 'Terminated';
      case 'resigned':
        return 'Resigned';
      default:
        return status;
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEmploymentDuration = (hireDate) => {
    const hire = new Date(hireDate);
    const today = new Date();
    const diffTime = today - hire;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const years = Math.floor(months / 12);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'active').length;
  const averageRating = staff.reduce((sum, s) => sum + s.rating, 0) / staff.length;
  const totalOvertimeHours = staff.reduce((sum, s) => sum + s.overtimeHours, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage your team, track performance, and handle HR operations</p>
        </div>
        
        <button
          onClick={handleAddStaff}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-semibold text-gray-900">{totalStaff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Staff</p>
              <p className="text-2xl font-semibold text-gray-900">{activeStaff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-semibold text-gray-900">{averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Overtime</p>
              <p className="text-2xl font-semibold text-gray-900">{totalOvertimeHours}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleAddStaff}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Add Staff</p>
              <p className="text-xs text-gray-500">Hire new employees</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Performance reviews will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Performance Reviews</p>
              <p className="text-xs text-gray-500">Evaluate staff performance</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Attendance tracking will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Attendance</p>
              <p className="text-xs text-gray-500">Track work hours</p>
            </div>
          </button>

          <button
            onClick={() => toast.info('Training management will be implemented next')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Training</p>
              <p className="text-xs text-gray-500">Manage staff development</p>
            </div>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search staff by name, employee ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Position Filter */}
          <div className="lg:w-48">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Positions</option>
              <option value="store_manager">Store Manager</option>
              <option value="assistant_manager">Assistant Manager</option>
              <option value="cashier">Cashier</option>
              <option value="inventory_manager">Inventory Manager</option>
              <option value="sales_associate">Sales Associate</option>
              <option value="security_guard">Security Guard</option>
              <option value="cleaner">Cleaner</option>
              <option value="delivery_driver">Delivery Driver</option>
              <option value="warehouse_worker">Warehouse Worker</option>
              <option value="customer_service">Customer Service</option>
              <option value="supervisor">Supervisor</option>
              <option value="trainee">Trainee</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
              <option value="resigned">Resigned</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? "bg-primary-100 text-primary-600" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' 
                  ? "bg-primary-100 text-primary-600" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow">
        {viewMode === 'grid' ? (
          <div className="p-6">
            {filteredStaff.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
                <p className="text-gray-600">
                  {searchTerm || positionFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first staff member'
                  }
                </p>
                {!searchTerm && positionFilter === 'all' && statusFilter === 'all' && (
                  <button
                    onClick={handleAddStaff}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((staffMember) => (
                  <div key={staffMember.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {staffMember.firstName} {staffMember.lastName}
                          </h3>
                          {staffMember.firstNameMyanmar && staffMember.lastNameMyanmar && (
                            <p className="text-sm text-gray-600 mb-2">
                              {staffMember.firstNameMyanmar} {staffMember.lastNameMyanmar}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mb-2">{staffMember.employeeId}</p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {getPositionText(staffMember.position)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(staffMember.status)}`}>
                              {getStatusText(staffMember.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Store and Department */}
                      <div>
                        <p className="text-sm text-gray-600">Store & Department</p>
                        <p className="text-sm font-medium text-gray-900">{staffMember.storeName}</p>
                        <p className="text-sm text-gray-500">{getDepartmentText(staffMember.department)}</p>
                      </div>

                      {/* Performance */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-600">Rating</p>
                          <div className="flex items-center gap-1">
                            <span className={`text-lg font-semibold ${getRatingColor(staffMember.rating)}`}>
                              {staffMember.rating}
                            </span>
                            <Star className={`w-4 h-4 ${getRatingColor(staffMember.rating)}`} />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Employment</p>
                          <p className="text-sm text-gray-900">{getEmploymentDuration(staffMember.hireDate)}</p>
                        </div>
                      </div>

                      {/* Work Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-600">Days Worked</p>
                          <p className="text-sm text-gray-900">{staffMember.totalDaysWorked}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Overtime</p>
                          <p className="text-sm text-gray-900">{staffMember.overtimeHours}h</p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="text-sm text-gray-900">{staffMember.phone}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="text-sm text-gray-900">{staffMember.email}</span>
                        </div>
                      </div>

                      {/* Salary */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Salary:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {staffMember.salary.toLocaleString()} {staffMember.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Hired: {new Date(staffMember.hireDate).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewStaff(staffMember)}
                            className="px-3 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditStaff(staffMember)}
                            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handlePerformanceReview(staffMember)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Award className="w-3 h-3 mr-1" />
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {staffMember.firstName.charAt(0)}{staffMember.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {staffMember.firstName} {staffMember.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{staffMember.employeeId}</div>
                          {staffMember.firstNameMyanmar && staffMember.lastNameMyanmar && (
                            <div className="text-sm text-gray-500">
                              {staffMember.firstNameMyanmar} {staffMember.lastNameMyanmar}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getPositionText(staffMember.position)}</div>
                      <div className="text-sm text-gray-500">{getDepartmentText(staffMember.department)}</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(staffMember.status)}`}>
                        {getStatusText(staffMember.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staffMember.storeName}</div>
                      <div className="text-sm text-gray-500">
                        {getEmploymentDuration(staffMember.hireDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-medium ${getRatingColor(staffMember.rating)}`}>
                          {staffMember.rating}
                        </span>
                        <Star className={`w-4 h-4 ${getRatingColor(staffMember.rating)}`} />
                      </div>
                      <div className="text-sm text-gray-500">
                        {staffMember.salary.toLocaleString()} {staffMember.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staffMember.totalDaysWorked} days</div>
                      <div className="text-sm text-gray-500">{staffMember.totalHoursWorked} hours</div>
                      <div className="text-sm text-gray-500">{staffMember.overtimeHours} overtime</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewStaff(staffMember)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                          title="View Staff"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditStaff(staffMember)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                          title="Edit Staff"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePerformanceReview(staffMember)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Performance Review"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStaff.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
                <p className="text-gray-600">No staff members match your current filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;