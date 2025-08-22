import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Store, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginCredentials>();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsSubmitting(true);
      await login(data);
      navigate('/dashboard');
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Login failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="flex-1 bg-primary-600 flex items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <Store size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Mini Market Manager
          </h1>
          <p className="text-xl text-primary-100">
            Streamline your multi-store operations with real-time inventory, sales tracking, and comprehensive analytics.
          </p>
          <div className="mt-8 space-y-4 text-left">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-200 rounded-full mr-3"></div>
              <span>Multi-store management</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-200 rounded-full mr-3"></div>
              <span>Real-time inventory tracking</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-200 rounded-full mr-3"></div>
              <span>Advanced POS system</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-200 rounded-full mr-3"></div>
              <span>Comprehensive reporting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md">
                {errors.root.message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : ''}`}
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : ''}`}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  handleSubmit((data) => onSubmit({
                    email: 'owner@minimarket.com',
                    password: 'password123'
                  }))();
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Demo Owner Account
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSubmit((data) => onSubmit({
                    email: 'employee@minimarket.com',
                    password: 'password123'
                  }))();
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Demo Employee Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;