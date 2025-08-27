/**
 * Supabase Real-time Hooks
 * Custom React hooks for real-time data subscriptions
 */

import { useEffect, useState, useCallback } from 'react';
import { createRealtimeSubscription } from '@/lib/supabase/client';
import { TaskService } from '@/lib/supabase/tasks';
import { Task, DashboardData, RecentTask, UrgentTask, TaskStatus, TaskPriority, TaskSource } from '@/lib/types/database';

// Real-time tasks hook
export function useRealtimeTasks(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await TaskService.getAllTasks();
      if (result.success) {
        setTasks(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set up real-time subscription
    const subscription = createRealtimeSubscription<Task>(
      'tasks',
      'deleted_at=is.null', // Only listen to non-deleted tasks
      // On insert
      (newTask) => {
        console.log('🔔 New task created:', newTask.task_number);
        setTasks(prev => [newTask, ...prev]);
      },
      // On update
      (updatedTask) => {
        console.log('🔄 Task updated:', updatedTask.task_number);
        setTasks(prev => 
          prev.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        );
      },
      // On delete (soft delete sets deleted_at)
      (deletedTask) => {
        console.log('🗑️ Task deleted:', deletedTask.task_number);
        setTasks(prev => 
          prev.filter(task => task.id !== deletedTask.id)
        );
      }
    );

    // Initial load if no initial tasks provided
    if (initialTasks.length === 0) {
      refreshTasks();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [initialTasks.length, refreshTasks]);

  return {
    tasks,
    loading,
    error,
    refreshTasks,
  };
}

// Real-time dashboard data hook
export function useRealtimeDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await TaskService.getDashboardData();
      if (result.success) {
        setDashboardData(result.data || null);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    refreshDashboard();

    // Set up real-time subscription to tasks table
    // Dashboard data will be refreshed when tasks change
    const subscription = createRealtimeSubscription<Task>(
      'tasks',
      undefined, // Listen to all changes
      // On any change, refresh dashboard
      () => refreshDashboard(),
      () => refreshDashboard(),
      () => refreshDashboard()
    );

    // Auto-refresh every 5 minutes as backup
    const interval = setInterval(refreshDashboard, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [refreshDashboard]);

  return {
    dashboardData,
    loading,
    error,
    lastUpdated,
    refreshDashboard,
  };
}

// Real-time urgent tasks hook
export function useRealtimeUrgentTasks() {
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUrgentTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await TaskService.getUrgentTasks();
      if (result.success) {
        setUrgentTasks(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch urgent tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    refreshUrgentTasks();

    // Set up real-time subscription specifically for urgent/high priority tasks
    const subscription = createRealtimeSubscription<Task>(
      'tasks',
      'priority=in.(urgent,high),deleted_at=is.null',
      // On insert of urgent task
      (newTask) => {
        console.log('🚨 New urgent task:', newTask.task_number);
        refreshUrgentTasks(); // Refresh the full urgent list
      },
      // On update of urgent task
      (updatedTask) => {
        console.log('🔄 Urgent task updated:', updatedTask.task_number);
        refreshUrgentTasks(); // Refresh the full urgent list
      },
      // On delete of urgent task
      () => {
        refreshUrgentTasks(); // Refresh the full urgent list
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUrgentTasks]);

  return {
    urgentTasks,
    loading,
    error,
    refreshUrgentTasks,
  };
}

// Real-time task search hook
export function useRealtimeTaskSearch(searchParams: {
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
} = {}) {
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const performSearch = useCallback(async (params = searchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await TaskService.searchTasks({
        search: params.search,
        status: params.status as TaskStatus,
        priority: params.priority as TaskPriority,
        source: params.source as TaskSource,
        page: pagination.page,
        limit: pagination.limit,
      });
      
      setSearchResults(result.tasks);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, pagination.page, pagination.limit]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const result = await TaskService.updateTask(taskId, updates);
      if (result.success) {
        // Update local state optimistically
        setSearchResults(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
          )
        );
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      return { success: false, error: 'Update failed' };
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string, reason?: string) => {
    try {
      const result = await TaskService.deleteTask(taskId, reason);
      if (result.success) {
        // Remove from local state
        setSearchResults(prev => 
          prev.filter(task => task.id !== taskId)
        );
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      return { success: false, error: 'Delete failed' };
    }
  }, []);

  return {
    searchResults,
    loading,
    error,
    pagination,
    performSearch,
    updateTask,
    deleteTask,
    setPage: (page: number) => setPagination(prev => ({ ...prev, page })),
    setLimit: (limit: number) => setPagination(prev => ({ ...prev, limit })),
  };
}

// Connection status hook
export function useSupabaseConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkConnection = useCallback(async () => {
    try {
      const startTime = Date.now();
      const result = await TaskService.getAllTasks(undefined, undefined, 1);
      const endTime = Date.now();
      
      setIsConnected(result.success);
      setLatency(endTime - startTime);
      setLastChecked(new Date());
    } catch (err) {
      setIsConnected(false);
      setLatency(null);
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    // Check connection immediately
    checkConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30 * 1000);

    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    isConnected,
    latency,
    lastChecked,
    checkConnection,
  };
}