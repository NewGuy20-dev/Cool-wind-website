/**
 * Hardened Supabase Server Client
 * Provides strict error handling and no silent fallbacks
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env, getEnvPresence } from "../env";
import { Database } from "@/lib/types/database";

// Admin client for server-side operations
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "X-Client-Info": "task-management-system-server",
        "X-Environment": env.NODE_ENV,
      },
    },
  }
);

/**
 * Test database connectivity
 */
export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  latency?: number;
  error?: {
    message: string;
    code?: string;
    hint?: string;
  };
  testQuery?: {
    success: boolean;
    rowCount?: number;
  };
}> {
  try {
    const startTime = Date.now();
    
    // Test basic connectivity with a simple query
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("id")
      .limit(1);
    
    const latency = Date.now() - startTime;
    
    if (error) {
      return {
        connected: false,
        latency,
        error: {
          message: error.message,
          code: error.code,
          hint: error.hint,
        },
        testQuery: {
          success: false,
        },
      };
    }
    
    return {
      connected: true,
      latency,
      testQuery: {
        success: true,
        rowCount: data?.length || 0,
      },
    };
  } catch (error: any) {
    return {
      connected: false,
      error: {
        message: error.message || "Unknown connection error",
      },
      testQuery: {
        success: false,
      },
    };
  }
}

/**
 * Enhanced error handler for database operations
 */
export function handleDatabaseError(error: any): {
  message: string;
  code?: string;
  hint?: string;
  isUserError: boolean;
  shouldRetry: boolean;
} {
  if (!error) {
    return {
      message: "Unknown database error",
      isUserError: false,
      shouldRetry: false,
    };
  }

  // Handle Supabase PostgrestError
  if (typeof error === "object" && error.code && error.message) {
    const isUserError = ["23505", "23503", "23514", "PGRST116"].includes(error.code);
    const shouldRetry = !isUserError && !["42501", "42P01"].includes(error.code);

    return {
      message: error.message,
      code: error.code,
      hint: error.hint,
      isUserError,
      shouldRetry,
    };
  }

  // Handle generic errors
  const message = error.message || String(error);
  return {
    message,
    isUserError: false,
    shouldRetry: !message.includes("permission") && !message.includes("not found"),
  };
}

/**
 * Retry wrapper for database operations
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorInfo = handleDatabaseError(error);
      
      // Don't retry user errors or non-retryable errors
      if (!errorInfo.shouldRetry || attempt === maxRetries) {
        break;
      }
      
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}

/**
 * Health check function for API routes
 */
export async function getDatabaseHealthStatus() {
  const envStatus = getEnvPresence();
  const connectionTest = await testDatabaseConnection();
  
  return {
    timestamp: new Date().toISOString(),
    environment: envStatus,
    database: connectionTest,
    service: {
      name: "task-management-system",
      version: "1.0.0",
      status: connectionTest.connected ? "healthy" : "unhealthy",
    },
  };
}

/**
 * Logging helper that respects environment
 */
export function logDatabaseOperation(
  operation: string,
  details: {
    success: boolean;
    duration?: number;
    error?: any;
    metadata?: Record<string, any>;
  }
) {
  const logData = {
    operation,
    timestamp: new Date().toISOString(),
    success: details.success,
    duration: details.duration,
    ...(details.metadata && { metadata: details.metadata }),
  };

  if (details.success) {
    console.log(`✅ [DB:${operation}]`, logData);
  } else {
    const errorInfo = handleDatabaseError(details.error);
    console.error(`❌ [DB:${operation}]`, {
      ...logData,
      error: {
        message: errorInfo.message,
        code: errorInfo.code,
        hint: errorInfo.hint,
        isUserError: errorInfo.isUserError,
        shouldRetry: errorInfo.shouldRetry,
      },
    });
  }
}