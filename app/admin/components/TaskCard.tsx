'use client';

import { useState } from 'react';
import { FailedCallTask, formatPhoneNumber, cleanPhoneNumber } from '../../../lib/failed-calls-db';
import { 
  Phone, 
  Clock, 
  User, 
  MessageSquare, 
  AlertCircle, 
  Calendar, 
  Trash2,
  Edit3,
  MoreVertical 
} from 'lucide-react';

interface TaskCardProps {
  task: FailedCallTask;
  onDragStart: (task: FailedCallTask) => void;
  onDragEnd: () => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<FailedCallTask>) => void;
}

const getPriorityColor = (priority: FailedCallTask['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getPriorityLabel = (priority: FailedCallTask['priority']) => {
  switch (priority) {
    case 'high':
      return 'Urgent';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return 'Unknown';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  onDelete,
  onUpdate,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(task.notes || '');

  const handlePhoneClick = (phoneNumber: string) => {
    const cleanedNumber = cleanPhoneNumber(phoneNumber);
    window.location.href = `tel:${cleanedNumber}`;
    
    // Increment attempt counter
    onUpdate(task.id, {
      attemptCount: task.attemptCount + 1,
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(task);
    setShowMenu(false);
  };

  const handleSaveNotes = () => {
    onUpdate(task.id, { notes: editNotes });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
    setShowMenu(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow relative touch-manipulation"
    >
      {/* Priority Indicator */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}
            title={getPriorityLabel(task.priority)}
          />
          <span className="text-xs font-medium text-gray-600">
            {getPriorityLabel(task.priority)}
          </span>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Name */}
      <div className="flex items-center space-x-2 mb-2">
        <User className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-800 truncate">{task.customerName}</h3>
      </div>

      {/* Phone Number with Auto-Dial */}
      <div className="flex items-center space-x-2 mb-3">
        <Phone className="w-4 h-4 text-blue-500" />
        <button
          onClick={() => handlePhoneClick(task.phoneNumber)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm underline min-h-[44px] flex items-center touch-manipulation"
          title="Click to dial"
        >
          {formatPhoneNumber(task.phoneNumber)}
        </button>
      </div>

      {/* Problem Description */}
      <div className="flex items-start space-x-2 mb-3">
        <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
        <p className="text-sm text-gray-700 line-clamp-2">{task.problemDescription}</p>
      </div>

      {/* Attempt Counter */}
      {task.attemptCount > 0 && (
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-orange-600">
            {task.attemptCount} attempt{task.attemptCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Scheduled Callback Time */}
      {task.scheduledCallbackTime && (
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4 text-purple-500" />
          <span className="text-sm text-purple-600">
            {new Date(task.scheduledCallbackTime).toLocaleString()}
          </span>
        </div>
      )}

      {/* Callback Preference */}
      {task.callbackPreference && (
        <div className="text-xs text-gray-600 mb-2">
          <strong>Preferred time:</strong> {task.callbackPreference}
        </div>
      )}

      {/* Notes Section */}
      {(task.notes || isEditing) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes about customer availability..."
                className="w-full text-xs p-2 border border-gray-300 rounded resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveNotes}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditNotes(task.notes || '');
                  }}
                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-600 italic">{task.notes}</p>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
        <Clock className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-500">
          {formatTimestamp(task.createdAt)}
        </span>
      </div>
    </div>
  );
}