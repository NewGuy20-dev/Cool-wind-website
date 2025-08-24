'use client';

import { useState, useEffect } from 'react';
import { FailedCallTask } from '../../../lib/failed-calls-db';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const COLUMNS = [
  { id: 'new', title: 'New Failed Calls', status: 'new' as const },
  { id: 'unavailable', title: 'Customer Unavailable', status: 'unavailable' as const },
  { id: 'scheduled', title: 'Scheduled Callbacks', status: 'scheduled' as const },
  { id: 'progress', title: 'In Progress', status: 'progress' as const },
  { id: 'completed', title: 'Completed', status: 'completed' as const },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<FailedCallTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<FailedCallTask | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/failed-calls');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (task: FailedCallTask) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = async (targetStatus: FailedCallTask['status']) => {
    if (!draggedTask || draggedTask.status === targetStatus) {
      return;
    }

    try {
      const response = await fetch(`/api/failed-calls/${draggedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: targetStatus,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/failed-calls/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<FailedCallTask>) => {
    try {
      const response = await fetch(`/api/failed-calls/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getTasksByStatus = (status: FailedCallTask['status']) => {
    return tasks.filter(task => task.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">Task Overview</h2>
          <div className="text-sm text-gray-600 mt-1 sm:mt-0">
            Total: {tasks.length} tasks
          </div>
        </div>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Mobile view - stacked columns */}
      <div className="block md:hidden space-y-6">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            status={column.status}
            taskCount={getTasksByStatus(column.status).length}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {getTasksByStatus(column.status).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
              />
            ))}
          </KanbanColumn>
        ))}
      </div>

      {/* Desktop view - horizontal columns */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            status={column.status}
            taskCount={getTasksByStatus(column.status).length}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {getTasksByStatus(column.status).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
              />
            ))}
          </KanbanColumn>
        ))}
      </div>

      {/* Task creation form modal would go here */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
            <p className="text-gray-600 mb-4">
              New task form will be implemented here.
            </p>
            <button
              onClick={() => setShowNewTaskForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}