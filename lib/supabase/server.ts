import { createClient } from "@supabase/supabase-js";
import { env, validateCriticalEnv } from "../env";

// Validate env on import
try {
  validateCriticalEnv();
} catch (err) {
  console.error("[SUPABASE] Critical environment validation failed:", err);
  throw err;
}

console.log("[SUPABASE] Creating admin client with URL:", env.SUPABASE_URL ? "✓ Present" : "✗ Missing");

export const supabaseAdmin = createClient(
  env.SUPABASE_URL || "",
  env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    // Add more debugging
    db: {
      schema: "public"
    }
  }
);

// Test connection on startup (optional, but helpful for debugging)
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin.from("tasks").select("count").limit(1);
    if (error) {
      console.error("[SUPABASE] Connection test failed:", error);
      return { success: false, error };
    }
    console.log("[SUPABASE] Connection test successful");
    return { success: true, data };
  } catch (err) {
    console.error("[SUPABASE] Connection test error:", err);
    return { success: false, error: err };
  }
}

// Alias for testSupabaseConnection (for backward compatibility)
export const testDatabaseConnection = testSupabaseConnection;

// Get database health status
export async function getDatabaseHealthStatus() {
  try {
    const startTime = Date.now();
    const { data, error } = await supabaseAdmin.from("tasks").select("count", { count: 'exact', head: true }).limit(1);
    const latency = Date.now() - startTime;
    
    if (error) {
      return {
        connected: false,
        latency,
        error,
        status: 'unhealthy'
      };
    }
    
    return {
      connected: true,
      latency,
      status: 'healthy',
      testQuery: { success: true, data }
    };
  } catch (err) {
    return {
      connected: false,
      error: err,
      status: 'error'
    };
  }
}

// Log database operations (for debugging)
export function logDatabaseOperation(operation: string, details: any) {
  console.log(`[SUPABASE] ${operation}:`, details);
}
