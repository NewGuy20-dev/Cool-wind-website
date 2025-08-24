'use client';

import { ReactNode } from 'react';
import { FailedCallTask } from '../../../lib/failed-calls-db';

interface KanbanColumnProps {
  title: string;
  status: FailedCallTask['status'];
  taskCount: number;
  children: ReactNode;
  onDrop: (status: FailedCallTask['status']) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const getColumnColor = (status: FailedCallTask['status']) => {
  switch (status) {
    case 'new':
      return 'bg-blue-50 border-blue-200';
    case 'unavailable':
      return 'bg-yellow-50 border-yellow-200';
    case 'scheduled':
      return 'bg-purple-50 border-purple-200';
    case 'progress':
      return 'bg-orange-50 border-orange-200';
    case 'completed':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getHeaderColor = (status: FailedCallTask['status']) => {
  switch (status) {
    case 'new':
      return 'text-blue-800 bg-blue-100';
    case 'unavailable':
      return 'text-yellow-800 bg-yellow-100';
    case 'scheduled':
      return 'text-purple-800 bg-purple-100';
    case 'progress':
      return 'text-orange-800 bg-orange-100';
    case 'completed':
      return 'text-green-800 bg-green-100';
    default:
      return 'text-gray-800 bg-gray-100';
  }
};

export default function KanbanColumn({
  title,
  status,
  taskCount,
  children,
  onDrop,
  onDragOver,
}: KanbanColumnProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(status);
  };

  return (
    <div
      className={`rounded-lg border-2 border-dashed min-h-64 sm:min-h-96 ${getColumnColor(status)} transition-colors`}
      onDrop={handleDrop}
      onDragOver={onDragOver}
    >
      <div className={`p-4 rounded-t-lg ${getHeaderColor(status)}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
            {taskCount}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {children}
        
        {taskCount === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}