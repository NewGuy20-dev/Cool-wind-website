/**
 * Database Type Definitions
 * Generated TypeScript types for Supabase database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Custom enums matching database enums
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskSource = 'chat-failed-call' | 'admin-manual' | 'api-direct' | 'webhook' | 'email' | 'phone'

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          task_number: string
          customer_name: string
          phone_number: string
          location: string | null
          title: string
          description: string | null
          problem_description: string
          status: TaskStatus
          priority: TaskPriority
          category: string | null
          source: TaskSource
          estimated_duration: string | null
          actual_duration: string | null
          due_date: string | null
          completed_at: string | null
          assigned_to: string | null
          assigned_at: string | null
          ai_priority_reason: string | null
          urgency_keywords: string[] | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          metadata: Json
          chat_context: Json | null
        }
        Insert: {
          id?: string
          task_number?: string
          customer_name: string
          phone_number: string
          location?: string | null
          title: string
          description?: string | null
          problem_description: string
          status?: TaskStatus
          priority?: TaskPriority
          category?: string | null
          source?: TaskSource
          estimated_duration?: string | null
          actual_duration?: string | null
          due_date?: string | null
          completed_at?: string | null
          assigned_to?: string | null
          assigned_at?: string | null
          ai_priority_reason?: string | null
          urgency_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          metadata?: Json
          chat_context?: Json | null
        }
        Update: {
          id?: string
          task_number?: string
          customer_name?: string
          phone_number?: string
          location?: string | null
          title?: string
          description?: string | null
          problem_description?: string
          status?: TaskStatus
          priority?: TaskPriority
          category?: string | null
          source?: TaskSource
          estimated_duration?: string | null
          actual_duration?: string | null
          due_date?: string | null
          completed_at?: string | null
          assigned_to?: string | null
          assigned_at?: string | null
          ai_priority_reason?: string | null
          urgency_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          metadata?: Json
          chat_context?: Json | null
        }
        Relationships: []
      }
      task_audit_log: {
        Row: {
          id: string
          task_id: string
          action: string
          old_values: Json | null
          new_values: Json | null
          changed_fields: string[] | null
          changed_by: string | null
          change_source: string | null
          changed_at: string
          reason: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          task_id: string
          action: string
          old_values?: Json | null
          new_values?: Json | null
          changed_fields?: string[] | null
          changed_by?: string | null
          change_source?: string | null
          changed_at?: string
          reason?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          task_id?: string
          action?: string
          old_values?: Json | null
          new_values?: Json | null
          changed_fields?: string[] | null
          changed_by?: string | null
          change_source?: string | null
          changed_at?: string
          reason?: string | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_audit_log_task_id"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          comment: string
          comment_type: string
          author_id: string | null
          author_name: string | null
          author_type: string
          is_internal: boolean
          is_customer_visible: boolean
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          task_id: string
          comment: string
          comment_type?: string
          author_id?: string | null
          author_name?: string | null
          author_type?: string
          is_internal?: boolean
          is_customer_visible?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          task_id?: string
          comment?: string
          comment_type?: string
          author_id?: string | null
          author_name?: string | null
          author_type?: string
          is_internal?: boolean
          is_customer_visible?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_comments_task_id"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      task_attachments: {
        Row: {
          id: string
          task_id: string
          filename: string
          original_filename: string
          file_size: number
          mime_type: string
          storage_path: string
          storage_provider: string
          file_hash: string | null
          is_image: boolean
          image_dimensions: string | null
          is_public: boolean
          uploaded_by: string | null
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          task_id: string
          filename: string
          original_filename: string
          file_size: number
          mime_type: string
          storage_path: string
          storage_provider?: string
          file_hash?: string | null
          is_image?: boolean
          image_dimensions?: string | null
          is_public?: boolean
          uploaded_by?: string | null
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          task_id?: string
          filename?: string
          original_filename?: string
          file_size?: number
          mime_type?: string
          storage_path?: string
          storage_provider?: string
          file_hash?: string | null
          is_image?: boolean
          image_dimensions?: string | null
          is_public?: boolean
          uploaded_by?: string | null
          created_at?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_attachments_task_id"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      performance_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          metric_unit: string | null
          measurement_time: string
          metadata: Json
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value: number
          metric_unit?: string | null
          measurement_time?: string
          metadata?: Json
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          metric_unit?: string | null
          measurement_time?: string
          metadata?: Json
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          id: string
          alert_type: string
          severity: string
          title: string
          description: string | null
          metadata: Json
          is_acknowledged: boolean
          acknowledged_by: string | null
          acknowledged_at: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          alert_type: string
          severity: string
          title: string
          description?: string | null
          metadata?: Json
          is_acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          alert_type?: string
          severity?: string
          title?: string
          description?: string | null
          metadata?: Json
          is_acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_dashboard_overview: {
        Row: {
          pending_count: number | null
          in_progress_count: number | null
          completed_count: number | null
          cancelled_count: number | null
          urgent_count: number | null
          high_count: number | null
          medium_count: number | null
          low_count: number | null
          today_created: number | null
          today_completed: number | null
          overdue_count: number | null
          avg_completion_hours: number | null
          chat_failed_call_count: number | null
          admin_manual_count: number | null
          total_tasks: number | null
          last_updated: string | null
        }
        Relationships: []
      }
      v_recent_tasks: {
        Row: {
          id: string | null
          task_number: string | null
          customer_name: string | null
          phone_number: string | null
          title: string | null
          problem_description: string | null
          status: TaskStatus | null
          priority: TaskPriority | null
          location: string | null
          source: TaskSource | null
          created_at: string | null
          updated_at: string | null
          task_age: string | null
          status_color: string | null
          priority_color: string | null
        }
        Relationships: []
      }
      v_urgent_attention: {
        Row: {
          id: string | null
          task_number: string | null
          customer_name: string | null
          phone_number: string | null
          title: string | null
          problem_description: string | null
          status: TaskStatus | null
          priority: TaskPriority | null
          location: string | null
          source: TaskSource | null
          created_at: string | null
          updated_at: string | null
          age: string | null
          attention_status: string | null
          escalation_deadline: string | null
        }
        Relationships: []
      }
      v_customer_history: {
        Row: {
          phone_number: string | null
          customer_name: string | null
          location: string | null
          total_tasks: number | null
          first_service_date: string | null
          last_service_date: string | null
          completed_tasks: number | null
          cancelled_tasks: number | null
          urgent_tasks: number | null
          avg_resolution_hours: number | null
          recent_problems: string | null
          customer_status: string | null
          risk_level: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_dashboard_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          overview: Json | null
          recent_tasks: Json | null
          urgent_tasks: Json | null
          daily_stats: Json | null
        }[]
      }
      search_tasks: {
        Args: {
          search_term?: string
          filter_status?: TaskStatus
          filter_priority?: TaskPriority
          filter_source?: TaskSource
          date_from?: string
          date_to?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          task_number: string
          customer_name: string
          phone_number: string
          title: string
          problem_description: string
          status: TaskStatus
          priority: TaskPriority
          location: string
          source: TaskSource
          created_at: string
          updated_at: string
          comment_count: number
          attachment_count: number
          relevance_score: number
        }[]
      }
      get_customer_insights: {
        Args: {
          customer_phone: string
        }
        Returns: {
          customer_info: Json | null
          task_history: Json | null
          satisfaction_metrics: Json | null
          recommendations: Json | null
        }[]
      }
      get_task_stats: {
        Args: {
          start_date?: string
          end_date?: string
        }
        Returns: {
          total_tasks: number
          completed_tasks: number
          pending_tasks: number
          in_progress_tasks: number
          cancelled_tasks: number
          completion_rate: number
          avg_completion_time: string
          high_priority_count: number
          urgent_priority_count: number
        }[]
      }
      check_system_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          details: Json
        }[]
      }
      auto_escalate_priority: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      task_status: TaskStatus
      task_priority: TaskPriority
      task_source: TaskSource
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Utility types for easier usage
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type TaskComment = Database['public']['Tables']['task_comments']['Row']
export type TaskCommentInsert = Database['public']['Tables']['task_comments']['Insert']

export type TaskAuditLog = Database['public']['Tables']['task_audit_log']['Row']
export type TaskAttachment = Database['public']['Tables']['task_attachments']['Row']

export type DashboardOverview = Database['public']['Views']['v_dashboard_overview']['Row']
export type RecentTask = Database['public']['Views']['v_recent_tasks']['Row']
export type UrgentTask = Database['public']['Views']['v_urgent_attention']['Row']
export type CustomerHistory = Database['public']['Views']['v_customer_history']['Row']

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Task-specific API types
export interface TaskCreateRequest extends Omit<TaskInsert, 'id' | 'task_number' | 'created_at' | 'updated_at'> {
  // Additional validation or computed fields can be added here
}

export interface TaskUpdateRequest extends TaskUpdate {
  id: string // Make ID required for updates
}

export interface TaskSearchParams {
  search?: string
  status?: TaskStatus
  priority?: TaskPriority
  source?: TaskSource
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface TaskSearchResult {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard data types
export interface DashboardData {
  overview: DashboardOverview
  recentTasks: RecentTask[]
  urgentTasks: UrgentTask[]
  dailyStats: any[]
}

// Customer insights types
export interface CustomerInsights {
  customerInfo: CustomerHistory
  taskHistory: Task[]
  satisfactionMetrics: {
    satisfaction_score: number
    avg_resolution_hours: number
    completion_rate: number
  }
  recommendations: {
    priority_level: 'high' | 'medium' | 'standard'
    suggested_actions: string[]
  }
}

// Error types
export interface DatabaseError {
  message: string
  code?: string
  details?: string
  isUserError: boolean
}

// Real-time subscription types
export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: T
  old?: T
  schema: string
  table: string
  commit_timestamp: string
}

export interface SubscriptionCallbacks<T = any> {
  onInsert?: (payload: T) => void
  onUpdate?: (payload: T) => void
  onDelete?: (payload: T) => void
}

// Migration and maintenance types
export interface SystemHealth {
  checkName: string
  status: 'OK' | 'WARNING' | 'CRITICAL'
  details: Json
}

export interface PerformanceMetrics {
  totalQueries: number
  avgDuration: number
  maxDuration: number
  minDuration: number
  slowQueries: number
  recentQueries: Array<{
    query: string
    duration: number
    timestamp: Date
  }>
}