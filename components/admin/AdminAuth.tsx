'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui/spinner';

interface AdminAuthProps {
  onAuthSuccess: () => void;
}

export default function AdminAuth({ onAuthSuccess }: AdminAuthProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_key', password); // Store the actual password they entered
        
        // Trigger success animation
        setIsAuthenticated(true);
        
        // Wait for animation to complete before transitioning
        setTimeout(() => {
          onAuthSuccess();
        }, 1500); // 1.5 seconds for smooth transition
      } else {
        setError('Invalid password. Please try again.');
        setIsLoading(false);
        setPassword(''); // Clear password field
        
        // Trigger shake animation
        setShake(true);
        setTimeout(() => setShake(false), 650); // Reset after animation
      }
    } catch (error) {
      setError('Authentication failed. Please check your connection and try again.');
      setIsLoading(false);
      setPassword(''); // Clear password field
      
      // Trigger shake animation
      setShake(true);
      setTimeout(() => setShake(false), 650); // Reset after animation
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .shake-animation {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-12 px-4 sm:px-6 lg:px-8 transition-all duration-700 ${isAuthenticated ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className={`max-w-md w-full transition-all duration-500 ${isAuthenticated ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className={`mx-auto h-20 w-20 flex items-center justify-center rounded-2xl shadow-2xl mb-6 transform transition-all duration-500 ${
            isAuthenticated 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-125 rotate-12' 
              : shake
              ? 'bg-gradient-to-br from-red-500 to-red-600 scale-110'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:scale-110'
          }`}>
            {isAuthenticated ? (
              <CheckCircleIcon className="h-10 w-10 text-white animate-bounce" />
            ) : (
              <LockClosedIcon className={`h-10 w-10 text-white ${shake ? 'animate-pulse' : ''}`} />
            )}
          </div>
          <h2 className={`text-4xl font-bold bg-clip-text text-transparent mb-3 transition-all duration-500 ${
            isAuthenticated 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}>
            {isAuthenticated ? 'Access Granted!' : 'Admin Access'}
          </h2>
          <p className="text-gray-600 font-medium">
            Cool Wind Services - Admin Panel
          </p>
        </div>
        
        {/* Auth Card */}
        <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 ${shake ? 'shake-animation' : ''}`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none rounded-xl relative block w-full px-4 py-4 pl-12 pr-12 border-2 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white text-base font-medium ${
                    shake 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your admin password"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none hover:bg-gray-100 p-1 rounded-lg transition-all"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-gradient-to-r from-red-50 to-red-100 p-4 border-2 border-red-200 shadow-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || isAuthenticated}
                className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed shadow-lg transition-all duration-300 ${
                  isAuthenticated 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-2xl scale-105' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {isAuthenticated ? (
                  <div className="flex items-center animate-pulse">
                    <CheckCircleIcon className="h-6 w-6 mr-2" />
                    Access Granted! Redirecting...
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center">
                    <Spinner variant="circle" size={20} className="text-white mr-3" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LockClosedIcon className="h-5 w-5 mr-2" />
                    Access Admin Panel
                  </div>
                )}
              </button>
            </div>
          </form>
          
          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Secure authentication powered by Cool Wind Services</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-medium">
            Protected access for authorized administrators only
          </p>
        </div>
      </div>
    </div>
    </>
  );
}