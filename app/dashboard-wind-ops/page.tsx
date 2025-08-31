'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { 
  PlusIcon, 
  TicketIcon, 
  ChartBarIcon, 
  ClockIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  BellIcon,
  Cog6ToothIcon,
  HomeIcon,
  ChartPieIcon,
  CalendarDaysIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import AdminAuth from '@/components/admin/AdminAuth';
import FailedCallsKanban from '@/components/admin/FailedCallsKanban';
import TicketManagement from '@/components/admin/TicketManagement';
import TaskForm from '@/components/admin/TaskForm';
import DashboardStats from '@/components/admin/DashboardStats';

interface AdminPageState {
  isAuthenticated: boolean;
  activeTab: 'dashboard' | 'failed-calls' | 'tickets' | 'create-task';
  loading: boolean;
  stats: any;
  tickets: any[];
  failedCalls: any[];
  notifications: {
    hasUnread: boolean;
    count: number;
    lastChecked: string;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [state, setState] = useState<AdminPageState>({
    isAuthenticated: false,
    activeTab: 'dashboard',
    loading: true,
    stats: null,
    tickets: [],
    failedCalls: [],
    notifications: {
      hasUnread: false,
      count: 0,
      lastChecked: new Date().toISOString()
    }
  });

  const checkAuthStatus = () => {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
    setState(prev => ({ ...prev, isAuthenticated, loading: false }));
  };

  const handleAuthSuccess = () => {
    setState(prev => ({ ...prev, isAuthenticated: true }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setState(prev => ({ ...prev, isAuthenticated: false }));
    router.push('/');
  };

  const handleNotificationClick = () => {
    // Mark all notifications as read
    setState(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        hasUnread: false,
        count: 0,
        lastChecked: new Date().toISOString()
      }
    }));
    
    // Store the last checked time in localStorage to persist across sessions
    localStorage.setItem('admin_notifications_last_checked', new Date().toISOString());
  };

  const checkForNewNotifications = useCallback(async () => {
    try {
      // Get last checked time from localStorage
      const lastChecked = localStorage.getItem('admin_notifications_last_checked') || 
                         new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Default to 24h ago
      
      // Get base URL from environment or fallback to current origin
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      
      // Check for new tickets created since last check (not by admin)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${baseUrl}/api/notifications/check?since=${encodeURIComponent(lastChecked)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        setState(prev => ({
          ...prev,
          notifications: {
            hasUnread: data.hasNew || false,
            count: data.count || 0,
            lastChecked: prev.notifications.lastChecked
          }
        }));
      } else {
        console.warn(`Notifications API returned ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      // Only log non-abort errors to avoid spam when component unmounts
      if (error.name !== 'AbortError') {
        console.warn('Error checking notifications (will retry):', error.message);
      }
    }
  }, []);

  const loadTaskStats = async () => {
    try {
      console.log('🔄 Loading task stats...');
      const response = await fetch('/api/tasks/stats');
      console.log('📊 Task stats response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📈 Task stats result:', result);
        console.log('📋 Task stats data:', result.data);
        setState(prev => ({ ...prev, stats: result.data }));
      } else {
        console.error('❌ Task stats API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error loading task stats:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks?limit=50');
      if (response.ok) {
        const result = await response.json();
        setState(prev => ({ ...prev, tickets: result.data }));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadFailedCalls = async () => {
    try {
      const response = await fetch('/api/failed-calls');
      if (response.ok) {
        const result = await response.json();
        setState(prev => ({ ...prev, failedCalls: Array.isArray(result) ? result : result.data || [] }));
      }
    } catch (error) {
      console.error('Error loading failed calls:', error);
    }
  };

  const loadDashboardData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Load data based on active tab using new Supabase endpoints
      if (state.activeTab === 'dashboard' || state.activeTab === 'tickets') {
        await Promise.all([
          loadTaskStats(),
          loadTasks(),
          loadFailedCalls()
        ]);
      } else if (state.activeTab === 'failed-calls') {
        await loadFailedCalls();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.activeTab]);

  useEffect(() => {
    // Check authentication status
    checkAuthStatus();
  }, []);

  useEffect(() => {
    let notificationInterval: NodeJS.Timeout | null = null;
    
    if (state.isAuthenticated) {
      // Load initial data
      loadDashboardData();
      
      // Check for notifications immediately
      checkForNewNotifications();
      
      // Set up interval to check for notifications every 30 seconds
      notificationInterval = setInterval(() => {
        checkForNewNotifications();
      }, 30000);
    }
    
    return () => {
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
    };
  }, [state.isAuthenticated, checkForNewNotifications, loadDashboardData]);

  useEffect(() => {
    if (state.isAuthenticated && state.activeTab) {
      loadDashboardData();
    }
  }, [state.activeTab, loadDashboardData]);

  const refreshData = () => {
    loadDashboardData();
    // Also check for notifications when refreshing
    checkForNewNotifications();
  };

  if (state.loading && !state.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner variant="circle" size={48} className="text-blue-600" />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <AdminAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="Cool Wind Services" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Cool Wind Services</h1>
                  <span className="text-xs text-gray-500">Administrative Dashboard</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium rounded-full shadow-sm">
                Admin Panel
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">Live Updates</span>
              </div>
              
              <button 
                onClick={handleNotificationClick}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
                title={`${state.notifications.count} unread notifications`}
              >
                <BellIcon className="h-5 w-5" />
                {state.notifications.hasUnread && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs animate-pulse">
                    {state.notifications.count > 0 && state.notifications.count < 10 && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        {state.notifications.count}
                      </span>
                    )}
                  </span>
                )}
              </button>
              
              <button
                onClick={refreshData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-all hover:rotate-180 duration-300"
                title="Refresh Data"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: ChartPieIcon, count: null },
              { key: 'failed-calls', label: 'Failed Calls', icon: ExclamationTriangleIcon, count: state.failedCalls.length },
              { key: 'tickets', label: 'Service Tickets', icon: TicketIcon, count: state.tickets.length },
              { key: 'create-task', label: 'Create Task', icon: PlusIcon, count: null }
            ].map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setState(prev => ({ ...prev, activeTab: key as any }))}
                className={`flex items-center px-4 py-3 mx-1 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  state.activeTab === key
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md transform -translate-y-0.5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } whitespace-nowrap`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
                {count !== null && count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    state.activeTab === key 
                      ? 'bg-white/20 text-white' 
                      : 'bg-red-100 text-red-600'
                  }`}>
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
        {state.loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner variant="circle" size={48} className="text-blue-600" />
          </div>
        ) : (
          <>
            {state.activeTab === 'dashboard' && (
              <DashboardView 
                stats={state.stats} 
                tickets={state.tickets} 
                failedCalls={state.failedCalls}
                onTabChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}
              />
            )}
            
            {state.activeTab === 'failed-calls' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Failed Call Management</h2>
                  <p className="text-gray-600 mt-1">Manage customer callback requests and failed communications</p>
                </div>
                <FailedCallsKanban data={state.failedCalls} onUpdate={refreshData} />
              </div>
            )}
            
            {state.activeTab === 'tickets' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Service Ticket Management</h2>
                  <p className="text-gray-600 mt-1">Comprehensive service request tracking and management</p>
                </div>
                <TicketManagement tickets={state.tickets} onUpdate={refreshData} />
              </div>
            )}
            
            {state.activeTab === 'create-task' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Service Request</h2>
                  <p className="text-gray-600 mt-1">Create new service tickets and failed call entries</p>
                </div>
                <TaskForm onTaskCreated={refreshData} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Dashboard Overview Component
function DashboardView({ stats, tickets, failedCalls, onTabChange }: {
  stats: any;
  tickets: any[];
  failedCalls: any[];
  onTabChange: (tab: 'failed-calls' | 'tickets') => void;
}) {
  const recentTickets = tickets.slice(0, 5);
  const recentFailedCalls = failedCalls.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <DashboardStats stats={stats} />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onTabChange('tickets')}
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
          >
            <TicketIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Manage Tickets</div>
              <div className="text-sm text-gray-600">View and update service requests</div>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange('failed-calls')}
            className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
          >
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Failed Calls</div>
              <div className="text-sm text-gray-600">Handle callback requests</div>
            </div>
          </button>
          
          <button
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
          >
            <ChartBarIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Analytics</div>
              <div className="text-sm text-gray-600">View performance metrics</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tickets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Service Tickets</h3>
              <button
                onClick={() => onTabChange('tickets')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTickets.length > 0 ? recentTickets.map((ticket) => (
              <div key={ticket.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {ticket.task_number}
                      </span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {ticket.problem_description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <span>{ticket.customer_name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">
                <TicketIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No service tickets yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Failed Calls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Failed Calls</h3>
              <button
                onClick={() => onTabChange('failed-calls')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentFailedCalls.length > 0 ? recentFailedCalls.map((call) => (
              <div key={call.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {call.customer_name}
                      </span>
                      <StatusBadge status={call.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {call.problem_description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <span>{call.phone_number}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(call.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <PriorityBadge priority={call.priority} />
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">
                <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No failed calls</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    new: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'New' },
    acknowledged: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Acknowledged' },
    scheduled: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Scheduled' },
    in_progress: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'In Progress' },
    progress: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'In Progress' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
    unavailable: { bg: 'bg-red-100', text: 'text-red-800', label: 'Unavailable' },
    on_hold: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'On Hold' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// Priority Badge Component
function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig = {
    low: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Low' },
    medium: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Medium' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
    critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' }
  };

  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}