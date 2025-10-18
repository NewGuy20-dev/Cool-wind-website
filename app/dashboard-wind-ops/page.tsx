'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { motion, useAnimation } from 'framer-motion';
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

  // Logo spin animation controls
  const logoControls = useAnimation();
  const triggerLogoSpin = async () => {
    await logoControls.start({
      rotate: 360,
      transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] },
    });
    // Reset rotation instantly after completing the spin
    logoControls.set({ rotate: 0 });
  };

  const checkAuthStatus = () => {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
    setState(prev => ({ ...prev, isAuthenticated, loading: false }));
  };
  
  const handleAuthSuccess = () => {
    setState(prev => ({ ...prev, isAuthenticated: true }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_key');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={logoControls}
                  onMouseEnter={triggerLogoSpin}
                  onClick={triggerLogoSpin}
                  onTouchStart={triggerLogoSpin}
                  className="cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
                    <img 
                      src="/logo.png" 
                      alt="Cool Wind Services" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Cool Wind Services</h1>
                  <span className="text-xs text-gray-600 font-medium">Administrative Dashboard</span>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg">
                Admin Panel
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-md"></div>
                <span className="text-xs text-green-700 font-semibold">Live Updates</span>
              </div>
              
              <button 
                onClick={handleNotificationClick}
                className="p-2.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all relative"
                title={`${state.notifications.count} unread notifications`}
              >
                <BellIcon className="h-5 w-5" />
                {state.notifications.hasUnread && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-xs animate-pulse shadow-lg">
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
                className="p-2.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all hover:rotate-180 duration-300"
                title="Refresh Data"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
              
              <button className="p-2.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 overflow-x-auto py-2">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: ChartPieIcon, count: null },
              { key: 'failed-calls', label: 'Failed Calls', icon: ExclamationTriangleIcon, count: state.failedCalls.length },
              { key: 'tickets', label: 'Service Tickets', icon: TicketIcon, count: state.tickets.length },
              { key: 'create-task', label: 'Create Task', icon: PlusIcon, count: null },
              { key: 'spare-parts', label: 'Spare Parts', icon: Cog6ToothIcon, count: null, isLink: true },
              { key: 'orders', label: 'Bulk Orders', icon: ChartBarIcon, count: null, isLink: true }
            ].map(({ key, label, icon: Icon, count, isLink }) => (
              <button
                key={key}
                onClick={() => {
                  if (isLink) {
                    router.push(`/dashboard-wind-ops/${key}`);
                  } else {
                    setState(prev => ({ ...prev, activeTab: key as any }));
                  }
                }}
                className={`flex items-center px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  state.activeTab === key
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
                } whitespace-nowrap`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
                {count !== null && count > 0 && (
                  <span className={`ml-2 px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    state.activeTab === key 
                      ? 'bg-white/30 text-white' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm'
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
                <div className="mb-8">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Failed Call Management</h2>
                  <p className="text-gray-600 mt-2 text-lg">Manage customer callback requests and failed communications</p>
                </div>
                <FailedCallsKanban data={state.failedCalls} onUpdate={refreshData} />
              </div>
            )}
            
            {state.activeTab === 'tickets' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Service Ticket Management</h2>
                  <p className="text-gray-600 mt-2 text-lg">Comprehensive service request tracking and management</p>
                </div>
                <TicketManagement tickets={state.tickets} onUpdate={refreshData} />
              </div>
            )}
            
            {state.activeTab === 'create-task' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Create New Service Request</h2>
                  <p className="text-gray-600 mt-2 text-lg">Create new service tickets and failed call entries</p>
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => onTabChange('tickets')}
            className="flex items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl transition-all text-left border-2 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1 duration-200 group"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-110 transition-transform mr-4">
              <TicketIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg mb-1">Manage Tickets</div>
              <div className="text-sm text-gray-600 font-medium">View and update service requests</div>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange('failed-calls')}
            className="flex items-center p-6 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-2xl transition-all text-left border-2 border-orange-200 hover:border-orange-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1 duration-200 group"
          >
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md group-hover:scale-110 transition-transform mr-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg mb-1">Failed Calls</div>
              <div className="text-sm text-gray-600 font-medium">Handle callback requests</div>
            </div>
          </button>
          
          <button
            className="flex items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl transition-all text-left border-2 border-green-200 hover:border-green-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1 duration-200 group"
          >
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md group-hover:scale-110 transition-transform mr-4">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg mb-1">Analytics</div>
              <div className="text-sm text-gray-600 font-medium">View performance metrics</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tickets */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Recent Service Tickets</h3>
              <button
                onClick={() => onTabChange('tickets')}
                className="text-blue-600 hover:text-blue-700 text-sm font-bold bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTickets.length > 0 ? recentTickets.map((ticket) => (
              <div key={ticket.id} className="p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        {ticket.task_number}
                      </span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="text-sm text-gray-700 mt-2 truncate font-medium">
                      {ticket.problem_description}
                    </p>
                    <div className="flex items-center text-xs text-gray-600 mt-2 font-medium">
                      <span>{ticket.customer_name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <TicketIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-900 text-lg">No service tickets yet</p>
                <p className="text-sm text-gray-500 mt-1">Tickets will appear here once created</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Failed Calls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Recent Failed Calls</h3>
              <button
                onClick={() => onTabChange('failed-calls')}
                className="text-orange-600 hover:text-orange-700 text-sm font-bold bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                View All →
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentFailedCalls.length > 0 ? recentFailedCalls.map((call) => (
              <div key={call.id} className="p-5 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-red-50/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        {call.customer_name}
                      </span>
                      <StatusBadge status={call.status} />
                    </div>
                    <p className="text-sm text-gray-700 mt-2 truncate font-medium">
                      {call.problem_description}
                    </p>
                    <div className="flex items-center text-xs text-gray-600 mt-2 font-medium">
                      <span>{call.phone_number}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(call.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <PriorityBadge priority={call.priority} />
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-900 text-lg">No failed calls</p>
                <p className="text-sm text-gray-500 mt-1">Failed calls will appear here</p>
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
    new: { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'text-white', label: 'New' },
    acknowledged: { bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600', text: 'text-white', label: 'Acknowledged' },
    scheduled: { bg: 'bg-gradient-to-r from-purple-500 to-purple-600', text: 'text-white', label: 'Scheduled' },
    in_progress: { bg: 'bg-gradient-to-r from-orange-500 to-orange-600', text: 'text-white', label: 'In Progress' },
    progress: { bg: 'bg-gradient-to-r from-orange-500 to-orange-600', text: 'text-white', label: 'In Progress' },
    completed: { bg: 'bg-gradient-to-r from-green-500 to-green-600', text: 'text-white', label: 'Completed' },
    cancelled: { bg: 'bg-gradient-to-r from-gray-500 to-gray-600', text: 'text-white', label: 'Cancelled' },
    unavailable: { bg: 'bg-gradient-to-r from-red-500 to-red-600', text: 'text-white', label: 'Unavailable' },
    on_hold: { bg: 'bg-gradient-to-r from-gray-500 to-gray-600', text: 'text-white', label: 'On Hold' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${config.bg} ${config.text} shadow-sm`}>
      {config.label}
    </span>
  );
}

// Priority Badge Component
function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig = {
    low: { bg: 'bg-gradient-to-r from-gray-400 to-gray-500', text: 'text-white', label: 'Low', icon: '●' },
    medium: { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'text-white', label: 'Medium', icon: '●●' },
    high: { bg: 'bg-gradient-to-r from-orange-500 to-orange-600', text: 'text-white', label: 'High', icon: '●●●' },
    critical: { bg: 'bg-gradient-to-r from-red-500 to-red-600', text: 'text-white', label: 'Critical', icon: '⚠️' }
  };

  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${config.bg} ${config.text} shadow-md`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}