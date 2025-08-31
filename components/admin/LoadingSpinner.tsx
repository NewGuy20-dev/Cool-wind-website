'use client';

import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'dots' | 'pulse';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  text = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  const renderSpinner = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} animate-spin rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-75`}>
              <div className="absolute inset-2 rounded-full bg-white"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-blue-500 animate-pulse" />
            </div>
          </div>
        );
      
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 bg-blue-500 rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-ping opacity-75`}></div>
            <div className={`absolute inset-0 ${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}></div>
          </div>
        );
      
      default:
        return (
          <ArrowPathIcon className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
        );
    }
  };

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="mb-4">
          {renderSpinner()}
        </div>
        {text && (
          <p className="text-sm text-gray-600 font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Specialized loading components
export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-50 px-6 py-3 border-b">
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardLoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded-full w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded-full w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <CardLoadingSkeleton key={i} />
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
