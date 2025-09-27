import { Task, TaskStatus, TaskPriority, TaskSource } from '@/lib/types/database';

export type TaskApi = {
  id: string;
  taskNumber: string;
  customerName: string;
  phoneNumber: string;
  location?: string | null;
  title: string;
  description?: string | null;
  problemDescription: string;
  status: 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'high' | 'medium' | 'low' | 'urgent' | null;
  category?: string | null;
  source?: string | null;
  estimatedDuration?: string | null;
  actualDuration?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  assignedTo?: string | null;
  assignedAt?: string | null;
  aiPriorityReason?: string | null;
  urgencyKeywords?: string[] | null;
  archived?: boolean; // Archive status
  createdAt: string; // ISO
  updatedAt: string;
  deletedAt?: string | null;
  metadata?: any;
  chatContext?: any;
};

export type TaskDbRow = Task;

export type TaskCreatePayload = Partial<TaskDbRow> & { id?: string };