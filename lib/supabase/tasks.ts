/**
 * Task Management Service for Supabase Integration
 * Provides high-level task operations with proper error handling and validation
 */

import { supabase, supabaseAdmin, handleSupabaseError, withRetry, SupabasePerformanceMonitor } from './client';
import {
  Task,
  TaskInsert,
  TaskUpdate,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskSearchParams,
  TaskSearchResult,
  ApiResponse,
  DashboardData,
  CustomerInsights,
  TaskStatus,
  TaskPriority,
  TaskSource
} from '@/lib/types/database';

export class TaskService {
  /**
   * Create a new task
   */
  static async createTask(taskData: TaskCreateRequest): Promise<ApiResponse<Task>> {
    const timer = SupabasePerformanceMonitor.startTimer('createTask');
    
    try {
      // Validate required fields
      if (!taskData.customer_name?.trim()) {
        return { success: false, error: 'Customer name is required' };
      }
      
      if (!taskData.phone_number?.trim()) {
        return { success: false, error: 'Phone number is required' };
      }
      
      if (!taskData.problem_description?.trim()) {
        return { success: false, error: 'Problem description is required' };
      }
      
      // Validate phone number format (10 digits starting with 6-9)
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = taskData.phone_number.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return { success: false, error: 'Phone number must be a valid 10-digit Indian mobile number' };
      }
      
      // Prepare insert data with defaults
      const insertData: TaskInsert = {
        customer_name: taskData.customer_name.trim(),
        phone_number: cleanPhone,
        title: taskData.title || `Service request from ${taskData.customer_name}`,
        problem_description: taskData.problem_description.trim(),
        location: taskData.location?.trim() || null,
        description: taskData.description?.trim() || null,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        source: taskData.source || 'api-direct',
        category: taskData.category || null,
        due_date: taskData.due_date || null,
        ai_priority_reason: taskData.ai_priority_reason || null,
        urgency_keywords: taskData.urgency_keywords || null,
        metadata: taskData.metadata || {},
        chat_context: taskData.chat_context || null,
      };
      
      const result = await withRetry(async () => {
        const { data, error } = await supabaseAdmin
          .from('tasks')
          .insert(insertData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });
      
      timer.end();
      
      return {
        success: true,
        data: result,
        message: 'Task created successfully',
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }
  
  /**
   * Get task by ID
   */
  static async getTaskById(taskId: string, options?: { admin?: boolean }): Promise<ApiResponse<Task>> {
    const timer = SupabasePerformanceMonitor.startTimer('getTaskById');
    
    try {
      const client = options?.admin ? supabaseAdmin : supabase;
      const result = await withRetry(async () => {
        const { data, error } = await client
          .from('tasks')
          .select(`
            *,
            task_comments:task_comments(count),
            task_attachments:task_attachments(count)
          `)
          .eq('id', taskId)
          .is('deleted_at', null)
          .single();
        
        if (error) throw error;
        return data;
      });
      
      timer.end();
      
      if (!result) {
        return { success: false, error: 'Task not found' };
      }
      
      return {
        success: true,
        data: result,
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }
  
  /**
   * Update task
   */
  static async updateTask(taskId: string, updates: Partial<TaskUpdate>): Promise<ApiResponse<Task>> {
    const timer = SupabasePerformanceMonitor.startTimer('updateTask');
    
    try {
      // Remove read-only fields
      const { id, task_number, created_at, ...safeUpdates } = updates;
      
      // Auto-set updated_at (this is handled by trigger, but good to be explicit)
      safeUpdates.updated_at = new Date().toISOString();
      
      const result = await withRetry(async () => {
        const { data, error } = await supabaseAdmin
          .from('tasks')
          .update(safeUpdates)
          .eq('id', taskId)
          .is('deleted_at', null)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });
      
      timer.end();
      
      return {
        success: true,
        data: result,
        message: 'Task updated successfully',
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }
  
  /**
   * Soft delete task
   */
  static async deleteTask(taskId: string, reason?: string): Promise<ApiResponse<void>> {
    const timer = SupabasePerformanceMonitor.startTimer('deleteTask');
    
    try {
      const result = await withRetry(async () => {
        const { error } = await supabaseAdmin
          .from('tasks')
          .update({
            deleted_at: new Date().toISOString(),
            metadata: {
              deleted_reason: reason || 'Deleted by admin',
              deleted_at: new Date().toISOString(),
            }
          })
          .eq('id', taskId)
          .is('deleted_at', null);
        
        if (error) throw error;
      });
      
      timer.end();
      
      return {
        success: true,
        message: 'Task deleted successfully',
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }
  
  /**
   * Search and filter tasks
   */
  static async searchTasks(params: TaskSearchParams = {}, options?: { admin?: boolean }): Promise<TaskSearchResult> {
    const timer = SupabasePerformanceMonitor.startTimer('searchTasks');
    
    try {
      const client = options?.admin ? supabaseAdmin : supabase;
      const {
        search,
        status,
        priority,
        source,
        dateFrom,
        dateTo,
        page = 1,
        limit = 50
      } = params;
      
      const offset = (page - 1) * limit;
      
      // Defensive normalization of source to hyphenated TaskSource enum
      const normalizeSource = (raw?: any): TaskSource | undefined => {
        if (!raw) return undefined;
        const v = String(raw).trim().toLowerCase();
        const hyphened = v.replace(/_/g, '-');
        const collapsed = v.replace(/[^a-z]/g, '');
        const map: Record<string, TaskSource> = {
          'chat-failed-call': 'chat-failed-call',
          'chat_failed_call': 'chat-failed-call',
          'chatfailedcall': 'chat-failed-call',
          'admin-manual': 'admin-manual',
          'admin_manual': 'admin-manual',
          'adminmanual': 'admin-manual',
          'api-direct': 'api-direct',
          'api_direct': 'api-direct',
          'apidirect': 'api-direct',
          'webhook': 'webhook',
          'email': 'email',
          'phone': 'phone',
        };
        const validList: TaskSource[] = ['chat-failed-call','admin-manual','api-direct','webhook','email','phone'];
        return map[v] || map[hyphened] || map[collapsed] || ((validList as string[]).includes(hyphened) ? (hyphened as TaskSource) : undefined);
      };
      const normalizedSource = normalizeSource(source);
      if (source && !normalizedSource) {
        console.warn('searchTasks: invalid source provided, ignoring filter', { source });
      }
      
      // Use the database search function for complex queries
      const { data: tasks, error } = await client
        .rpc('search_tasks', {
          search_term: search || undefined,
          filter_status: status || undefined,
          filter_priority: priority || undefined,
          filter_source: normalizedSource,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          limit_count: limit,
          offset_count: offset,
        });
      
      if (error) throw error;
      
      // Get total count for pagination
      let query = client
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);
      
      // Apply filters for count
      if (status) query = query.eq('status', status);
      if (priority) query = query.eq('priority', priority);
      if (normalizedSource) query = query.eq('source', normalizedSource);
      if (dateFrom) query = query.gte('created_at', dateFrom);
      if (dateTo) query = query.lte('created_at', dateTo);
      
      const { count, error: countError } = await query;
      
      if (countError) throw countError;
      
      timer.end();
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        tasks: (tasks || []) as unknown as Task[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        tasks: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 50,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }
  
  /**
   * Get all tasks (with optional filtering)
   */
  static async getAllTasks(
    status?: TaskStatus,
    priority?: TaskPriority,
    limit: number = 100,
    options?: { admin?: boolean }
  ): Promise<ApiResponse<Task[]>> {
    const timer = SupabasePerformanceMonitor.startTimer('getAllTasks');
    
    try {
      const client = options?.admin ? supabaseAdmin : supabase;
      let query = client
        .from('tasks')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (status) query = query.eq('status', status);
      if (priority) query = query.eq('priority', priority);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      timer.end();
      
      return {
        success: true,
        data: data || [],
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
        data: [],
      };
    }
  }
  
  /**
   * Get dashboard data
   */
  static async getDashboardData(options?: { admin?: boolean }): Promise<ApiResponse<DashboardData>> {
    const timer = SupabasePerformanceMonitor.startTimer('getDashboardData');
    
    try {
      const client = options?.admin ? supabaseAdmin : supabase;
      const { data, error } = await client
        .rpc('get_dashboard_data');
      
      if (error) throw error;
      
      timer.end();
      
      const dashboardData = data?.[0] || {
        overview: null,
        recent_tasks: [],
        urgent_tasks: [],
        daily_stats: [],
      };
      
      return {
        success: true,
        data: dashboardData as unknown as DashboardData,
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }
  
  /**
   * Get customer insights
   */
  static async getCustomerInsights(phoneNumber: string, options?: { admin?: boolean }): Promise<ApiResponse<CustomerInsights>> {
    const timer = SupabasePerformanceMonitor.startTimer('getCustomerInsights');
    
    try {
      const client = options?.admin ? supabaseAdmin : supabase;
      const { data, error } = await client
        .rpc('get_customer_insights', {
          customer_phone: phoneNumber,
        });
      
      if (error) throw error;
      
      timer.end();
      
      const insights = data?.[0] || {
        customer_info: null,
        task_history: [],
        satisfaction_metrics: null,
        recommendations: null,
      };
      
      return {
        success: true,
        data: insights as unknown as CustomerInsights,
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }
  
  /**
   * Get urgent tasks requiring attention
   */
  static async getUrgentTasks(options?: { admin?: boolean }): Promise<ApiResponse<Task[]>> {
    const timer = SupabasePerformanceMonitor.startTimer('getUrgentTasks');
    
    try {
      const client = options?.admin ? supabaseAdmin : supabase;
      const { data, error } = await client
        .from('v_urgent_attention')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      timer.end();
      
      return {
        success: true,
        data: (data || []) as unknown as Task[],
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
        data: [],
      };
    }
  }
  
  /**
   * Get task statistics
   */
  static async getTaskStats(startDate?: string, endDate?: string, options?: { admin?: boolean }): Promise<ApiResponse<any>> {
    const timer = SupabasePerformanceMonitor.startTimer('getTaskStats');
    
    try {
      const client = options?.admin ? supabaseAdmin : supabase;
      const { data, error } = await client
        .rpc('get_task_stats', {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        });
      
      if (error) throw error;
      
      timer.end();
      
      return {
        success: true,
        data: data?.[0] || {},
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }
  
  /**
   * Check system health
   */
  static async checkSystemHealth(options?: { admin?: boolean }): Promise<ApiResponse<any[]>> {
    const timer = SupabasePerformanceMonitor.startTimer('checkSystemHealth');
    
    try {
      const client = options?.admin ? supabaseAdmin : supabase;
      const { data, error } = await client
        .rpc('check_system_health');
      
      if (error) throw error;
      
      timer.end();
      
      return {
        success: true,
        data: data || [],
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
        data: [],
      };
    }
  }
  
  /**
   * Bulk update tasks
   */
  static async bulkUpdateTasks(
    taskIds: string[],
    updates: Partial<TaskUpdate>
  ): Promise<ApiResponse<Task[]>> {
    const timer = SupabasePerformanceMonitor.startTimer('bulkUpdateTasks');
    
    try {
      const { data, error } = await supabaseAdmin
        .from('tasks')
        .update(updates)
        .in('id', taskIds)
        .is('deleted_at', null)
        .select();
      
      if (error) throw error;
      
      timer.end();
      
      return {
        success: true,
        data: data || [],
        message: `${data?.length || 0} tasks updated successfully`,
      };
      
    } catch (error) {
      timer.end();
      const errorInfo = handleSupabaseError(error instanceof Error ? error : null);
      
      return {
        success: false,
        error: errorInfo.message,
        data: [],
      };
    }
  }
  
  /**
   * Get performance metrics
   */
  static getPerformanceStats() {
    return SupabasePerformanceMonitor.getStats();
  }
  
  /**
   * Clear performance monitoring data
   */
  static clearPerformanceStats() {
    SupabasePerformanceMonitor.clearStats();
  }

  /**
   * Find task by source and external ID for idempotency
   */
  static async findBySourceAndExternalId(source: string, external_id: string): Promise<Task | null> {
    const timer = SupabasePerformanceMonitor.startTimer('findBySourceAndExternalId');
    
    try {
      const { data, error } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('source', source as TaskSource)
        .contains('metadata', { external_id })
        .limit(1);

      timer.end();
      
      if (error) {
        throw error;
      }
      
      return data?.[0] || null;
    } catch (error) {
      timer.end();
      console.error('❌ Find by source and external ID error:', error);
      return null;
    }
  }

  /**
   * List all tasks for admin (no filtering)
   */
  static async listAdminTasks(): Promise<Task[]> {
    const timer = SupabasePerformanceMonitor.startTimer('listAdminTasks');
    
    try {
      const { data, error } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      timer.end();
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      timer.end();
      console.error('❌ List admin tasks error:', error);
      return [];
    }
  }
}