'use client';

import { useState, useEffect } from 'react';
import { 
  PhoneIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui/spinner';

interface FailedCall {
  id: string;
  customer_name: string;
  phone_number: string;
  problem_description: string;
  status: 'new' | 'contacted' | 'scheduled' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  location?: string;
  callback_time?: string;
}

interface FailedCallsKanbanProps {
  data: any[];
  onUpdate: () => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  icon: any;
}

const columns: KanbanColumn[] = [
  {
    id: 'new',
    title: 'New Calls',
    status: 'new',
    color: 'bg-red-50 border-red-200',
    icon: PhoneIcon
  },
  {
    id: 'contacted',
    title: 'Contacted',
    status: 'contacted',
    color: 'bg-yellow-50 border-yellow-200',
    icon: ClockIcon
  },
  {
    id: 'scheduled',
    title: 'Scheduled',
    status: 'scheduled',
    color: 'bg-blue-50 border-blue-200',
    icon: CalendarIcon
  },
  {
    id: 'resolved',
    title: 'Resolved',
    status: 'resolved',
    color: 'bg-green-50 border-green-200',
    icon: CheckCircleIcon
  }
];

export default function FailedCallsKanban({ data = [], onUpdate }: FailedCallsKanbanProps) {
  const [tasks, setTasks] = useState<FailedCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<FailedCall | null>(null);

  useEffect(() => {
    loadFailedCalls();
  }, [data]);

  const loadFailedCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/failed-calls');
      if (response.ok) {
        const result = await response.json();
        const failedCalls = Array.isArray(result) ? result : result.data || [];
        setTasks(failedCalls.map((call: any) => ({
          ...call,
          status: call.status || 'new'
        })));
      }
    } catch (error) {
      console.error('Error loading failed calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: FailedCall) => {
    setDraggedItem(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.status === targetStatus) {
      setDraggedItem(null);
      return;
    }

    try {
      const response = await fetch(`/api/failed-calls/${draggedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: targetStatus,
        }),
      });

      if (response.ok) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === draggedItem.id 
              ? { ...task, status: targetStatus as any }
              : task
          )
        );
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
    
    setDraggedItem(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return config[priority as keyof typeof config] || config.medium;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Spinner variant="circle" className="mr-3" size={20} />
          <span className="text-gray-600">Loading failed calls...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Failed Calls Kanban</h3>
            <p className="text-gray-600 text-sm">Drag and drop to update call status</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{tasks.length} total calls</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            const Icon = column.icon;
            
            return (
              <div
                key={column.id}
                className={`rounded-lg border-2 border-dashed ${column.color} min-h-96 transition-all duration-200`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">{column.title}</h4>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>
                
                <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900 text-sm">
                            {task.customer_name}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.problem_description}
                      </p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="h-3 w-3" />
                          <span>{task.phone_number}</span>
                        </div>
                        
                        {task.location && (
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="h-3 w-3" />
                            <span>{task.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-3 w-3" />
                          <span>{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No calls in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}