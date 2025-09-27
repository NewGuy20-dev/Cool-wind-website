'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  customerName: string;
  phoneNumber: string;
  problemDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'open';
  source: string;
  location?: string;
  aiPriorityReason?: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Analytics {
  totalTasks: number;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  tasksByStatus: {
    pending: number;
    open: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  recentTasks: Task[];
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/admin/tasks', {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setError('Invalid admin key');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      console.log('Received tasks data:', data.tasks);
      console.log('Completed tasks:', data.tasks.filter((task: Task) => task.status === 'completed'));
      setTasks(data.tasks.filter((task: Task) => !task.archived));
      setArchivedTasks(data.tasks.filter((task: Task) => task.archived));
      setAnalytics(data.analytics);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchTasks();
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ taskId, status: newStatus })
      });

      if (response.ok) {
        // Refresh tasks
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const archiveTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ taskId, action: 'archive' })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Task archived successfully:', result.message);
        // Refresh tasks
        fetchTasks();
      } else {
        const errorData = await response.json();
        alert(`Failed to archive task: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Failed to archive task:', err);
      alert('Failed to archive task. Please try again.');
    }
  };

  const unarchiveTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({ taskId, action: 'unarchive' })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Task unarchived successfully:', result.message);
        // Refresh tasks
        fetchTasks();
      } else {
        const errorData = await response.json();
        alert(`Failed to unarchive task: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Failed to unarchive task:', err);
      alert('Failed to unarchive task. Please try again.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'open': return 'text-cyan-600 bg-cyan-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleAuth}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Admin Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter admin key"
                required
              />
            </div>
            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Failed Call Tasks Dashboard</h1>
            <button
              onClick={fetchTasks}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800">Total Tasks</h3>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalTasks}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800">High Priority</h3>
                <p className="text-2xl font-bold text-red-600">{analytics.tasksByPriority.high}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800">Medium Priority</h3>
                <p className="text-2xl font-bold text-yellow-600">{analytics.tasksByPriority.medium}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800">Pending Tasks</h3>
                <p className="text-2xl font-bold text-green-600">{analytics.tasksByStatus.pending}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'active' ? 'Active Tasks' : 'Archived Tasks'}
              </h2>
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'active'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Active ({tasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'archived'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Archived ({archivedTasks.length})
                </button>
              </div>
            </div>
          </div>
          
          {(activeTab === 'active' ? tasks : archivedTasks).length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {activeTab === 'active' 
                ? 'No active tasks found. The failed call detection system is ready and waiting for customer reports.'
                : 'No archived tasks found.'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'active' ? 'Created' : 'Archived'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(activeTab === 'active' ? tasks : archivedTasks).map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.customerName}</div>
                          <div className="text-sm text-gray-500">{task.phoneNumber}</div>
                          {task.location && (
                            <div className="text-xs text-gray-400">{task.location}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={task.problemDescription}>
                          {task.problemDescription}
                        </div>
                        {task.aiPriorityReason && (
                          <div className="text-xs text-gray-500 mt-1" title={task.aiPriorityReason}>
                            AI: {task.aiPriorityReason.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(task.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          {activeTab === 'active' && (
                            <>
                              {(task.status === 'pending' || task.status === 'open') && (
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Start
                                </button>
                              )}
                              {task.status === 'in_progress' && (
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'completed')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Complete
                                </button>
                              )}
                              <a
                                href={`tel:${task.phoneNumber}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Call
                              </a>
                              {(task.status === 'completed' || task.status === 'cancelled') && (
                                <button
                                  onClick={() => archiveTask(task.id)}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Archive task"
                                >
                                  Archive
                                </button>
                              )}
                              {console.log('Task status check:', task.status, 'Should show archive:', task.status === 'completed' || task.status === 'cancelled', 'for task:', task.id)}
                            </>
                          )}
                          {activeTab === 'archived' && (
                            <>
                              <button
                                onClick={() => unarchiveTask(task.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Restore task to active list"
                              >
                                Unarchive
                              </button>
                              <a
                                href={`tel:${task.phoneNumber}`}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Call
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}