/**
 * Shared in-memory task storage
 * In production, this would be replaced with a database
 */

export interface TaskData {
  id: string;
  customerName: string;
  phoneNumber: string;
  problemDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  source: string;
  chatContext?: any[];
  aiPriorityReason?: string;
  location?: string;
  urgencyKeywords?: string[];
  archived?: boolean; // Archive status
  createdAt: string;
  updatedAt: string;
}

// In-memory task storage (in production, use database)
const tasks = new Map<string, TaskData>();

export class TaskStorage {
  static set(taskId: string, taskData: TaskData): void {
    tasks.set(taskId, taskData);
  }

  static get(taskId: string): TaskData | undefined {
    return tasks.get(taskId);
  }

  static getAll(): TaskData[] {
    return Array.from(tasks.values())
      .filter(task => !task.archived) // Filter out archived tasks by default
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  static getAllIncludingArchived(): TaskData[] {
    return Array.from(tasks.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static getArchived(): TaskData[] {
    return Array.from(tasks.values())
      .filter(task => task.archived === true)
      .sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  static update(taskId: string, updates: Partial<TaskData>): boolean {
    const existingTask = tasks.get(taskId);
    if (!existingTask) {
      return false;
    }

    const updatedTask = {
      ...existingTask,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    tasks.set(taskId, updatedTask);
    return true;
  }

  static archive(taskId: string): boolean {
    const existingTask = tasks.get(taskId);
    if (!existingTask) {
      return false;
    }

    // Don't allow archiving of pending, open, or in_progress tasks
    if (existingTask.status === 'pending' || existingTask.status === 'open' || existingTask.status === 'in_progress') {
      return false;
    }

    return this.update(taskId, { archived: true });
  }

  static unarchive(taskId: string): boolean {
    const existingTask = tasks.get(taskId);
    if (!existingTask || !existingTask.archived) {
      return false;
    }

    return this.update(taskId, { archived: false });
  }

  static delete(taskId: string): boolean {
    return tasks.delete(taskId);
  }

  static count(): number {
    return this.getAll().length; // Only count non-archived
  }

  static countArchived(): number {
    return this.getArchived().length;
  }

  static getByStatus(status: TaskData['status']): TaskData[] {
    return this.getAll().filter(task => task.status === status);
  }

  static getByPriority(priority: TaskData['priority']): TaskData[] {
    return this.getAll().filter(task => task.priority === priority);
  }

  static clear(): void {
    tasks.clear();
  }

  static getAnalytics() {
    const allTasks = this.getAll(); // Only active tasks
    const archivedTasks = this.getArchived();
    
    return {
      totalTasks: allTasks.length,
      archivedTasks: archivedTasks.length,
      tasksByPriority: {
        high: allTasks.filter(t => t.priority === 'high').length,
        medium: allTasks.filter(t => t.priority === 'medium').length,
        low: allTasks.filter(t => t.priority === 'low').length,
      },
      tasksByStatus: {
        pending: allTasks.filter(t => t.status === 'pending').length,
        open: allTasks.filter(t => t.status === 'open').length,
        in_progress: allTasks.filter(t => t.status === 'in_progress').length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        cancelled: allTasks.filter(t => t.status === 'cancelled').length,
      },
      recentTasks: allTasks.slice(0, 10)
    };
  }
}

// Generate task ID
export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}