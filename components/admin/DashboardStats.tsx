'use client';

import { 
  TicketIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface ActivityItem {
  type: 'completed' | 'created' | 'updated';
  message: string;
  time: string;
  priority: 'normal' | 'urgent';
}

interface DashboardStatsProps {
  stats: any;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total_tasks || 0,
      icon: TicketIcon,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      description: 'All service requests'
    },
    {
      title: 'Active Tasks', 
      value: stats.in_progress_tasks || 0,
      icon: BoltIcon,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50', 
      description: 'Currently in progress'
    },
    {
      title: 'Completed Today',
      value: stats.completed_tasks || 0,
      icon: CheckCircleIcon,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      description: 'Tasks resolved today'
    },
    {
      title: 'Priority Issues',
      value: stats.urgent_priority_count || 0,
      icon: FireIcon,
      gradient: 'from-red-500 to-pink-500',
      bgGradient: 'from-red-50 to-pink-50',
      description: 'Urgent attention needed'
    }
  ];

  const completionRate = stats.completionRate || 0;
  const priorityData = stats.byPriority || {};
  const serviceTypeData = stats.byServiceType || {};

  const recentActivity = stats.recentActivity || [];

  return (
    <div className="space-y-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Performance Metrics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
              <span className="text-xs font-medium text-green-700">Live Data</span>
            </div>
          </div>
          
          {/* Mini Performance Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">
                {stats.avgResponseTime ? `${stats.avgResponseTime}h` : '--'}
              </div>
              <div className="text-xs text-blue-600">Avg Response Time</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-700">
                {stats.completionRate ? `${stats.completionRate}%` : '--'}
              </div>
              <div className="text-xs text-green-600">Completion Rate</div>
            </div>
          </div>
          
          {stats.chartData ? (
            <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4">
              {/* Real chart would go here when implemented */}
              <div className="text-center py-8">
                <ChartBarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chart visualization ready</p>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div className="text-center">
                <ChartBarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No chart data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Activity Feed */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Real-time</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity: ActivityItem, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'completed' ? 'bg-green-100' : 
                    activity.type === 'created' ? 'bg-blue-100' : 'bg-yellow-100'
                  }`}>
                    {activity.type === 'completed' ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    ) : activity.type === 'created' ? (
                      <TicketIcon className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ClockIcon className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <span>{activity.time}</span>
                      {activity.priority === 'urgent' && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                          URGENT
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400">Activity will appear here as tasks are created and updated</p>
              </div>
            )}
          </div>
        </div>
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
          <UserGroupIcon className="h-5 w-5 text-gray-400" />
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
  );
}

// Individual Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  gradient,
  bgGradient,
  description
}: {
  title: string;
  value: number;
  icon: any;
  gradient: string;
  bgGradient: string;
  description: string;
}) {
  return (
    <div 
      className={`relative bg-gradient-to-br ${bgGradient} rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group`}
    >
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="h-20 w-20 text-gray-900" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      
      {/* Sparkle effect for completed tasks */}
      {(title === 'Completed Today' && value > 0) && (
        <div className="absolute top-2 right-2">
          <SparklesIcon className="h-4 w-4 text-yellow-400 animate-pulse" />
        </div>
      )}
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