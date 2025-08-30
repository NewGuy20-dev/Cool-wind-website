/**
 * Supabase Client Configuration
 * Robust, production-ready Supabase client with error handling and optimizations
 */

import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database';
import { env } from '../env';
import { supabaseAdmin } from './server';

// Environment validation
const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Client-side Supabase client (authenticated users)
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'task-management-system',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Helper functions
export function supabaseClient() {
  return supabase;
}

export function supabaseAdminClient() {
  // Service-role key (sensitive) — use only in dev/admin scripts
  return supabaseAdmin;
}

// Connection health check
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const startTime = Date.now();
    
    // Simple query to test connection
    const { error } = await supabase
      .from('tasks')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1);
    
    const latency = Date.now() - startTime;
    
    if (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
    
    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown connection error',
    };
  }
}

// Enhanced error handling utility
export function handleSupabaseError(error: PostgrestError | Error | null): {
  message: string;
  code?: string;
  details?: string;
  isUserError: boolean;
} {
  if (!error) {
    return {
      message: 'Unknown error occurred',
      isUserError: false,
    };
  }
  
  // Handle PostgrestError (Supabase database errors)
  if ('code' in error && 'details' in error) {
    const postgrestError = error as PostgrestError;
    
    // Map common error codes to user-friendly messages
    switch (postgrestError.code) {
      case '23505': // unique_violation
        return {
          message: 'A record with this information already exists',
          code: postgrestError.code,
          details: postgrestError.details,
          isUserError: true,
        };
      
      case '23503': // foreign_key_violation
        return {
          message: 'Referenced record does not exist',
          code: postgrestError.code,
          details: postgrestError.details,
          isUserError: true,
        };
      
      case '23514': // check_violation
        return {
          message: 'Data validation failed',
          code: postgrestError.code,
          details: postgrestError.details,
          isUserError: true,
        };
      
      case '42501': // insufficient_privilege
        return {
          message: 'Access denied',
          code: postgrestError.code,
          details: postgrestError.details,
          isUserError: false,
        };
      
      case 'PGRST116': // No rows found
        return {
          message: 'Record not found',
          code: postgrestError.code,
          details: postgrestError.details,
          isUserError: true,
        };
      
      default:
        return {
          message: postgrestError.message || 'Database error occurred',
          code: postgrestError.code,
          details: postgrestError.details,
          isUserError: false,
        };
    }
  }
  
  // Handle generic errors
  return {
    message: error.message || 'An unexpected error occurred',
    isUserError: false,
  };
}

// Retry mechanism for failed operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry user errors (validation, not found, etc.)
      const errorInfo = handleSupabaseError(lastError);
      if (errorInfo.isUserError) {
        throw lastError;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

// Real-time subscription helper
export function createRealtimeSubscription<T = any>(
  table: string,
  filter?: string,
  onInsert?: (payload: T) => void,
  onUpdate?: (payload: T) => void,
  onDelete?: (payload: T) => void
) {
  let subscription = supabase
    .channel(`realtime:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter,
      },
      (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload.new as T);
            break;
          case 'UPDATE':
            onUpdate?.(payload.new as T);
            break;
          case 'DELETE':
            onDelete?.(payload.old as T);
            break;
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
    }
  };
}

// Batch operations helper
export async function batchInsert<T>(
  table: string,
  records: T[],
  batchSize: number = 100
): Promise<{ success: boolean; inserted: number; errors: any[] }> {
  const errors: any[] = [];
  let totalInserted = 0;
  
  // Process in batches
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    try {
      const { error, data } = await supabaseAdmin
        .from(table as any)
        .insert(batch)
        .select();
      
      if (error) {
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: handleSupabaseError(error),
        });
      } else {
        totalInserted += data?.length || batch.length;
      }
    } catch (error) {
      errors.push({
        batch: Math.floor(i / batchSize) + 1,
        error: handleSupabaseError(error instanceof Error ? error : null),
      });
    }
  }
  
  return {
    success: errors.length === 0,
    inserted: totalInserted,
    errors,
  };
}

// Connection pool monitoring (for server environments)
export async function getConnectionStats() {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_connection_stats' as any);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.warn('Could not retrieve connection stats:', error);
    return null;
  }
}

// Performance monitoring
export class SupabasePerformanceMonitor {
  private static queries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }> = [];
  
  static startTimer(queryName: string) {
    const startTime = Date.now();
    
    return {
      end: () => {
        const duration = Date.now() - startTime;
        this.queries.push({
          query: queryName,
          duration,
          timestamp: new Date(),
        });
        
        // Keep only last 100 queries
        if (this.queries.length > 100) {
          this.queries = this.queries.slice(-100);
        }
        
        // Log slow queries (> 1 second)
        if (duration > 1000) {
          console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
        }
        
        return duration;
      }
    };
  }
  
  static getStats() {
    if (this.queries.length === 0) {
      return null;
    }
    
    const durations = this.queries.map(q => q.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    
    return {
      totalQueries: this.queries.length,
      avgDuration: Math.round(avgDuration),
      maxDuration,
      minDuration,
      slowQueries: this.queries.filter(q => q.duration > 1000).length,
      recentQueries: this.queries.slice(-10),
    };
  }
  
  static clearStats() {
    this.queries = [];
  }
}

// Export singleton instances
export { supabaseAdmin };
export default supabase;