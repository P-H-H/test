import api from './api';
import { ApiResponse, User, LoginCredentials, RegisterData } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  }

  // Register user
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    
    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Registration failed');
  }

  // Get current user
  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    
    if (response.data.success && response.data.data) {
      const user = response.data.data.user;
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    }
    
    throw new Error(response.data.message || 'Failed to get user');
  }

  // Update profile
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>('/auth/profile', profileData);
    
    if (response.data.success && response.data.data) {
      const user = response.data.data.user;
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    }
    
    throw new Error(response.data.message || 'Failed to update profile');
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await api.put<ApiResponse<void>>('/auth/change-password', {
      currentPassword,
      newPassword
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to change password');
    }
  }

  // Create employee (owner only)
  async createEmployee(employeeData: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/create-employee', employeeData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to create employee');
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }
}

export default new AuthService();