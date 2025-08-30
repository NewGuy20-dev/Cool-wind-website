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
