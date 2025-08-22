import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import authService from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && authService.isAuthenticated();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const token = authService.getToken();

        if (storedUser && token) {
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authService.getMe();
            setUser(currentUser);
          } catch (error) {
            // Token is invalid, clear storage
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const { user: loggedInUser } = await authService.login(credentials);
      setUser(loggedInUser);
      toast.success(`Welcome back, ${loggedInUser.firstName}!`);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const { user: registeredUser } = await authService.register(userData);
      setUser(registeredUser);
      toast.success(`Welcome, ${registeredUser.firstName}!`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      // Don't show error toast for refresh failures
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};