'use client';

import { useState, useEffect, ComponentType } from 'react';

import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  TicketIcon, 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  WifiIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

import AdminAuth from '@/components/admin/AdminAuth';
import ContactSubmissions from '@/components/admin/ContactSubmissions';
import { 
  useRealtimeDashboard, 
  useRealtimeUrgentTasks,
  useRealtimeTaskSearch,
  useSupabaseConnectionStatus
} from '@/lib/hooks/useSupabaseRealtimeHooks';
import { Spinner } from '@/components/ui/spinner';
import { TaskStatus, TaskPriority } from '@/lib/types/database';

interface AdminPageState {
  isAuthenticated: boolean;
  activeTab: 'dashboard' | 'tasks' | 'urgent' | 'create-task' | 'contact-submissions';
}

export default function SupabaseAdminDashboard() {
  const router = useRouter();
  const [state, setState] = useState<AdminPageState>({
    isAuthenticated: false,
    activeTab: 'dashboard',
  });

  // Real-time hooks
  const { dashboardData, loading: dashboardLoading, error: dashboardError, lastUpdated, refreshDashboard } = useRealtimeDashboard();
  const { urgentTasks, loading: urgentLoading, error: urgentError, refreshUrgentTasks } = useRealtimeUrgentTasks();
  const { isConnected, latency, checkConnection } = useSupabaseConnectionStatus();

  useEffect(() => {
    // Check authentication status
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
    setState(prev => ({ ...prev, isAuthenticated }));
  };

  const handleAuthSuccess = () => {
    setState(prev => ({ ...prev, isAuthenticated: true }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setState(prev => ({ ...prev, isAuthenticated: false }));
    router.push('/');
  };

  const refreshData = () => {
    refreshDashboard();
    refreshUrgentTasks();
    checkConnection();
  };

  if (!state.isAuthenticated) {
    return <AdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Cool Wind Services</h1>
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Supabase Admin
              </span>
              
              {/* Connection Status */}
              <div className="ml-4 flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <WifiIcon className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      Connected {latency && `(${latency}ms)`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <NoSymbolIcon className="h-4 w-4 mr-1" />
                    <span className="text-xs">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Last Updated */}
              <span className="text-xs text-gray-500">
                Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
              </span>
              
              <button
                onClick={refreshData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh Data"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { key: 'tasks', label: 'All Tasks', icon: TicketIcon },
              { key: 'urgent', label: 'Urgent Tasks', icon: ExclamationTriangleIcon, count: urgentTasks.length },
              { key: 'contact-submissions', label: 'Contact Forms', icon: MagnifyingGlassIcon },
              { key: 'create-task', label: 'Create Task', icon: PlusIcon }
            ].map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setState(prev => ({ ...prev, activeTab: key as any }))}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  state.activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
                {count !== undefined && count > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.activeTab === 'dashboard' && (
          <DashboardView 
            dashboardData={dashboardData}
            loading={dashboardLoading}
            error={dashboardError}
            onTabChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}
          />
        )}
        
        {state.activeTab === 'tasks' && (
          <TasksView />
        )}
        
        {state.activeTab === 'urgent' && (
          <UrgentTasksView 
            urgentTasks={urgentTasks}
            loading={urgentLoading}
            error={urgentError}
          />
        )}
        
        {state.activeTab === 'contact-submissions' && (
          <ContactSubmissions />
        )}
        
        {state.activeTab === 'create-task' && (
          <CreateTaskView onTaskCreated={refreshData} />
        )}
      </main>
    </div>
  );
}

// Dashboard Overview Component
function DashboardView({ 
  dashboardData, 
  loading, 
  error, 
  onTabChange 
}: {
  dashboardData: any;
  loading: boolean;
  error: string | null;
  onTabChange: (tab: 'tasks' | 'urgent') => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner variant="circle" size={48} className="text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XMarkIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const overview = dashboardData?.overview;

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={overview?.total_tasks || 0}
          icon={TicketIcon}
          color="blue"
          subtitle="All time"
        />
        <StatCard
          title="Pending"
          value={overview?.pending_count || 0}
          icon={ClockIcon}
          color="orange"
          subtitle="Awaiting action"
        />
        <StatCard
          title="In Progress"
          value={overview?.in_progress_count || 0}
          icon={ArrowPathIcon}
          color="purple"
          subtitle="Being worked on"
        />
        <StatCard
          title="Completed"
          value={overview?.completed_count || 0}
          icon={CheckCircleIcon}
          color="green"
          subtitle="Successfully resolved"
        />
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PriorityCard
            title="Urgent"
            count={overview?.urgent_count || 0}
            color="red"
            onClick={() => onTabChange('urgent')}
          />
          <PriorityCard
            title="High"
            count={overview?.high_count || 0}
            color="orange"
          />
          <PriorityCard
            title="Medium"
            count={overview?.medium_count || 0}
            color="yellow"
          />
          <PriorityCard
            title="Low"
            count={overview?.low_count || 0}
            color="gray"
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Today Created</span>
                <span className="font-medium">{overview?.today_created || 0}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Today Completed</span>
                <span className="font-medium">{overview?.today_completed || 0}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg. Completion Time</span>
                <span className="font-medium">
                  {overview?.avg_completion_hours 
                    ? `${Math.round(overview.avg_completion_hours)}h`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overdue Tasks</span>
                <span className={`font-medium ${(overview?.overdue_count || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {overview?.overdue_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => onTabChange('tasks')}
              className="w-full flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <TicketIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">View All Tasks</div>
                <div className="text-sm text-gray-600">Manage and update all tasks</div>
              </div>
            </button>
            
            <button
              onClick={() => onTabChange('urgent')}
              className="w-full flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left"
            >
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Urgent Tasks</div>
                <div className="text-sm text-gray-600">Handle priority issues</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Tasks Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            <button
              onClick={() => onTabChange('tasks')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
        </div>
        <div className="p-6">
          <RecentTasksList recentTasks={dashboardData?.recentTasks || []} />
        </div>
      </div>
    </div>
  );
}

// Tasks View Component
function TasksView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  const { 
    searchResults, 
    loading, 
    error, 
    pagination,
    updateTask,
    deleteTask,
    setPage 
  } = useRealtimeTaskSearch({
    search: searchTerm,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Tasks</h2>
        <div className="text-sm text-gray-500">
          {pagination.total} total tasks
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <TasksList 
          tasks={searchResults}
          loading={loading}
          error={error}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`px-3 py-1 rounded-md ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Supporting Components
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle 
}: {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  color: 'blue' | 'orange' | 'purple' | 'green' | 'red';
  subtitle: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-md ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function PriorityCard({ 
  title, 
  count, 
  color, 
  onClick 
}: {
  title: string;
  count: number;
  color: 'red' | 'orange' | 'yellow' | 'gray';
  onClick?: () => void;
}) {
  const colorClasses = {
    red: 'bg-red-100 text-red-800 border-red-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div 
      className={`p-4 rounded-lg border-2 ${colorClasses[color]} ${onClick ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
      onClick={onClick}
    >
      <div className="text-center">
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-sm font-medium">{title}</div>
      </div>
    </div>
  );
}

function UrgentTasksView({ urgentTasks, loading, error }: any) {
  if (loading) return <div className="p-6">Loading urgent tasks...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Urgent Tasks</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {urgentTasks.map((t: any) => (
              <tr key={t.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{t.title}</div>
                  <div className="text-xs text-gray-500">{t.task_number}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{t.customer_name}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                <td className="px-4 py-3 text-right text-sm text-gray-500">{new Date(t.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {urgentTasks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">No urgent tasks</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateTaskView({ onTaskCreated }: any) {
  return <div>Create Task View</div>;
}

function RecentTasksList({ recentTasks }: any) {
  return (
    <div className="overflow-hidden rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recentTasks.map((t: any) => (
            <tr key={t.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{t.title}</div>
                <div className="text-xs text-gray-500">{t.task_number}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{t.customer_name}</td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
              <td className="px-4 py-3 text-right text-sm text-gray-500">{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</td>
            </tr>
          ))}
          {recentTasks.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">No recent tasks</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TasksList({ tasks, loading, error, onUpdateTask, onDeleteTask }: any) {
  if (loading) return <div className="p-6">Loading tasks...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((t: any) => (
            <tr key={t.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{t.title}</div>
                <div className="text-xs text-gray-500">{t.task_number}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{t.customer_name}</td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
              <td className="px-4 py-3 text-right text-sm text-gray-500">{new Date(t.created_at).toLocaleString()}</td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex space-x-2">
                  <button
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                    onClick={() => onUpdateTask?.(t.id, { status: t.status })}
                  >
                    Update
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700"
                    onClick={() => onDeleteTask?.(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">No tasks found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// UI badges
function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<string, { text: string; cls: string }> = {
    pending: { text: 'Pending', cls: 'bg-orange-50 text-orange-700 ring-orange-200' },
    in_progress: { text: 'In Progress', cls: 'bg-purple-50 text-purple-700 ring-purple-200' },
    completed: { text: 'Completed', cls: 'bg-green-50 text-green-700 ring-green-200' },
    cancelled: { text: 'Cancelled', cls: 'bg-gray-50 text-gray-700 ring-gray-200' },
  };
  const m = map[String(status) as keyof typeof map] || map.pending;
  return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ring-1 ${m.cls}`}>{m.text}</span>;
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<string, { text: string; cls: string }> = {
    urgent: { text: 'Urgent', cls: 'bg-red-50 text-red-700 ring-red-200' },
    high: { text: 'High', cls: 'bg-orange-50 text-orange-700 ring-orange-200' },
    medium: { text: 'Medium', cls: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
    low: { text: 'Low', cls: 'bg-gray-50 text-gray-700 ring-gray-200' },
  };
  const m = map[String(priority) as keyof typeof map] || map.medium;
  return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ring-1 ${m.cls}`}>{m.text}</span>;
}