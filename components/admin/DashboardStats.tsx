'use client';

import { 
  TicketIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  stats: any;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.total || 0,
      icon: TicketIcon,
      color: 'blue',
      change: '+12%',
      changeType: 'increase' as const
    },
    {
      title: 'Pending Tickets',
      value: (stats.byStatus?.new || 0) + (stats.byStatus?.acknowledged || 0),
      icon: ClockIcon,
      color: 'yellow',
      change: '-5%',
      changeType: 'decrease' as const
    },
    {
      title: 'Completed',
      value: stats.byStatus?.completed || 0,
      icon: CheckCircleIcon,
      color: 'green',
      change: '+18%',
      changeType: 'increase' as const
    },
    {
      title: 'Critical Issues',
      value: stats.byPriority?.critical || 0,
      icon: ExclamationTriangleIcon,
      color: 'red',
      change: '-8%',
      changeType: 'decrease' as const
    }
  ];

  const completionRate = stats.completionRate || 0;
  const priorityData = stats.byPriority || {};
  const serviceTypeData = stats.byServiceType || {};

  return (
    <div className="space-y-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Completion Rate</h3>
            <TrendingUpIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {completionRate.toFixed(1)}%
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-600">
            {stats.byStatus?.completed || 0} of {stats.total || 0} tickets completed
          </p>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Priority Distribution</h3>
            <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {Object.entries(priorityData).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getPriorityColor(priority)}`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                </div>
                <span className="text-sm text-gray-600">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Types */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Types</h3>
            <UsersIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {Object.entries(serviceTypeData).slice(0, 4).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {formatServiceType(type)}
                </span>
                <span className="text-sm text-gray-600">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change, 
  changeType 
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  change: string;
  changeType: 'increase' | 'decrease';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${
          changeType === 'increase' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change}
        </span>
        <span className="text-sm text-gray-600 ml-2">from last month</span>
      </div>
    </div>
  );
}

// Helper Functions
function getPriorityColor(priority: string): string {
  const colors = {
    low: 'bg-gray-400',
    medium: 'bg-blue-400',
    high: 'bg-orange-400',
    critical: 'bg-red-400'
  };
  return colors[priority as keyof typeof colors] || 'bg-gray-400';
}

function formatServiceType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}