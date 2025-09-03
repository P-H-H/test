import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await login(data);
      if (!result.success) {
        setError('root', {
          type: 'manual',
          message: result.error,
        });
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center shadow-lg">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900 font-display">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Sign in to your Myanmar Supermarket account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`
                    block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm
                    placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    transition-colors duration-200
                    ${errors.email ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : 'border-neutral-300'}
                  `}
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`
                    block w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm
                    placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    transition-colors duration-200
                    ${errors.password ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : 'border-neutral-300'}
                  `}
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
                    <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.root && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
              <p className="text-sm text-error-600">{errors.root.message}</p>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link
                to="/auth/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`
                group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg
                text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                shadow-lg hover:shadow-xl
              `}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">New to the platform?</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Link
              to="/auth/register"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              Create an account
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-neutral-500">
          <p>© 2024 Myanmar Supermarket Management System</p>
          <p>Built with ❤️ for Myanmar's growing supermarket industry</p>
        </div>
      </div>
    </div>
  );
};

export default Login;