/**
 * Unified Type Definitions
 * Central export for all application types
 */

// Re-export database types
export * from './database';

// Import specific types for internal use
import { Task } from './database';

// Re-export chat types (maintaining backwards compatibility)
export * from './chat';

// Additional utility types for the application
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  priority?: string;
  source?: string;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// Environment configuration types
export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  app: {
    baseUrl: string;
    adminKey: string;
    environment: 'development' | 'staging' | 'production';
  };
  features: {
    chatAnalytics: boolean;
    realTimeUpdates: boolean;
    performanceMonitoring: boolean;
  };
}

// Migration compatibility types (for smooth transition)
export interface LegacyTaskData {
  id: string;
  customerName: string;
  phoneNumber: string;
  problemDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  source: string;
  chatContext?: any[];
  aiPriorityReason?: string;
  location?: string;
  urgencyKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

// Real-time event types
export interface TaskCreatedEvent {
  type: 'TASK_CREATED';
  task: Task;
  timestamp: string;
}

export interface TaskUpdatedEvent {
  type: 'TASK_UPDATED';
  task: Task;
  changes: Partial<Task>;
  timestamp: string;
}

export interface TaskDeletedEvent {
  type: 'TASK_DELETED';
  taskId: string;
  timestamp: string;
}

export type TaskEvent = TaskCreatedEvent | TaskUpdatedEvent | TaskDeletedEvent;

// Export specific types for backwards compatibility
export type { Task, TaskInsert, TaskUpdate } from './database';