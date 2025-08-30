# Cursor Task — Debug & Fix DB-Only Task Creation (Remove Mock Fallback)

**CRITICAL**: The current implementation is failing with "Unknown error" 500s. This prompt includes specific debugging steps and error handling improvements.

## Goal
Remove all mock-data fallback behavior and ensure every task creation path uses Supabase only, with comprehensive error handling, validation, logging, and tests. Fix the current 500 errors by implementing proper error boundaries and detailed logging.

**Branch**: `fix/task-no-mock-db-only-validation-tests`  
**PR Title**: `fix: remove mock fallback; enforce DB-only task creation with comprehensive error handling`

## Debugging Priority Actions (Do These First)

### 1. Immediate Error Diagnosis
Add comprehensive logging to identify the root cause of the 500 errors:

**File**: `pages/api/tasks/auto-create.ts` (or equivalent)
```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { createTaskRaw } from "@/services/taskService";
import { envPresence } from "@/lib/env";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("[DEBUG] === API Route Start ===");
  console.log("[DEBUG] Method:", req.method);
  console.log("[DEBUG] Headers:", JSON.stringify(req.headers, null, 2));
  console.log("[DEBUG] Body:", JSON.stringify(req.body, null, 2));
  console.log("[DEBUG] ENV Status:", JSON.stringify(envPresence(), null, 2));

  if (req.method !== "POST") {
    console.log("[DEBUG] Method not allowed:", req.method);
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    console.log("[DEBUG] About to call createTaskRaw...");
    const created = await createTaskRaw(req.body || {});
    console.log("[DEBUG] Task created successfully:", JSON.stringify(created, null, 2));
    return res.status(201).json({ data: created, source: "db" });
  } catch (err: any) {
    console.error("[ERROR] === Full Error Details ===");
    console.error("[ERROR] Error name:", err.name);
    console.error("[ERROR] Error message:", err.message);
    console.error("[ERROR] Error stack:", err.stack);
    console.error("[ERROR] Error details:", JSON.stringify(err.details, null, 2));
    console.error("[ERROR] Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    
    // Return detailed error info for debugging (remove in production)
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ 
        error: "DETAILED_DEBUG_ERROR",
        message: err.message,
        stack: err.stack,
        details: err.details,
        name: err.name
      });
    }
    
    if (err.message === "VALIDATION_FAILED") {
      return res.status(400).json({ error: "VALIDATION_FAILED", details: err.details });
    }
    if (err.message === "DB_INSERT_FAILED") {
      return res.status(500).json({ error: "DB_INSERT_FAILED", details: err.details ?? err.message });
    }
    return res.status(500).json({ 
      error: "TASK_CREATION_FAILED", 
      message: err.message || "Unknown error",
      details: err.details || null 
    });
  }
}
```

### 2. Enhanced Service Layer with Better Error Handling

**File**: `services/taskService.ts`
```typescript
import { normalizeTaskPayload, CreateTaskSchema, coerceTaskValues } from "@/lib/validation/taskSchema";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function createTaskRaw(payload: Record<string, any>) {
  console.log("[TaskService] Starting createTaskRaw with payload:", JSON.stringify(payload, null, 2));
  
  try {
    // Check if supabaseAdmin is properly initialized
    if (!supabaseAdmin) {
      throw new Error("SUPABASE_CLIENT_NOT_INITIALIZED");
    }
    
    console.log("[TaskService] Supabase client initialized, proceeding with normalization...");
    
    const normalized = normalizeTaskPayload(payload || {});
    console.log("[TaskService] Normalized payload:", JSON.stringify(normalized, null, 2));
    
    const parsed = CreateTaskSchema.safeParse(normalized);
    if (!parsed.success) {
      console.error("[TaskService] Validation failed:", JSON.stringify(parsed.error.format(), null, 2));
      throw Object.assign(new Error("VALIDATION_FAILED"), { details: parsed.error.format() });
    }
    
    console.log("[TaskService] Validation passed, coercing values...");
    const insertData = coerceTaskValues(parsed.data);
    console.log("[TaskService] Final insert data:", JSON.stringify(insertData, null, 2));

    console.log("[TaskService] Attempting Supabase insert...");
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error("[TaskService] Supabase error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw Object.assign(new Error("DB_INSERT_FAILED"), { 
        details: { 
          message: error.message, 
          code: error.code, 
          details: error.details,
          hint: error.hint
        } 
      });
    }
    
    if (!data) {
      console.error("[TaskService] No data returned from insert");
      throw new Error("NO_DATA_RETURNED");
    }
    
    console.log("[TaskService] Successfully created task:", JSON.stringify(data, null, 2));
    return data;
    
  } catch (err: any) {
    console.error("[TaskService] Uncaught error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      details: err.details
    });
    throw err;
  }
}
```

### 3. Enhanced Environment and Supabase Client Validation

**File**: `lib/env.ts`
```typescript
import { z } from "zod";

const EnvSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  NODE_ENV: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("[ENV] CRITICAL: Environment validation failed:", parsed.error.flatten().fieldErrors);
  // Don't throw here, let individual services handle missing env vars
}

export const env = {
  get SUPABASE_URL() { return process.env.SUPABASE_URL; },
  get SUPABASE_ANON_KEY() { return process.env.SUPABASE_ANON_KEY; },
  get SUPABASE_SERVICE_ROLE_KEY() { return process.env.SUPABASE_SERVICE_ROLE_KEY; },
  get NODE_ENV() { return process.env.NODE_ENV; },
  get NEXT_PUBLIC_SITE_URL() { return process.env.NEXT_PUBLIC_SITE_URL; },
};

export function envPresence() {
  const presence = {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NODE_ENV: process.env.NODE_ENV ?? null,
    NEXT_PUBLIC_SITE_URL: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    validationStatus: parsed.success ? "valid" : "invalid",
    validationError: parsed.success ? null : parsed.error.flatten().fieldErrors,
  };
  
  console.log("[ENV] Environment presence check:", presence);
  return presence;
}

// Validate critical env vars on startup
export function validateCriticalEnv() {
  const missing = [];
  if (!process.env.SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  
  if (missing.length > 0) {
    throw new Error(`CRITICAL_ENV_MISSING: ${missing.join(", ")}`);
  }
}
```

**File**: `lib/supabase/server.ts`
```typescript
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
```

## Step-by-Step Implementation

### Phase 1: Debug Current Issues
1. **Add the enhanced logging above** to identify the exact failure point
2. **Check your `.env.local` file** - ensure these are present:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. **Test Supabase connection** by adding this endpoint temporarily:

**File**: `pages/api/debug/supabase.ts`
```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { testSupabaseConnection } from "@/lib/supabase/server";
import { envPresence } from "@/lib/env";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const env = envPresence();
  const connection = await testSupabaseConnection();
  
  return res.status(200).json({
    environment: env,
    connection,
    timestamp: new Date().toISOString()
  });
}
```

### Phase 2: Remove Mock Code
```bash
# Search for and remove these patterns:
grep -r "MOCK_TASKS" . --exclude-dir=node_modules
grep -r "mock_tasks.json" . --exclude-dir=node_modules  
grep -r "USE_MOCK_DATA" . --exclude-dir=node_modules
grep -r "persistMockToFile" . --exclude-dir=node_modules
grep -r "source.*mock" . --exclude-dir=node_modules
```

### Phase 3: Enhanced Validation Schema

**File**: `lib/validation/taskSchema.ts`
```typescript
import { z } from "zod";

export const StatusEnum = z.enum(["open", "in_progress", "closed", "pending"]);
export const PriorityEnum = z.enum(["low", "medium", "high", "critical"]);

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
}).passthrough();

export function normalizeTaskPayload(raw: Record<string, any>) {
  console.log("[Validation] Normalizing payload:", raw);
  
  const normalized: Record<string, any> = { ...raw };

  // Handle common field name variations
  const fieldMappings = {
    Priority: 'priority',
    Status: 'status', 
    priorityLevel: 'priority',
    taskTitle: 'title',
    task_name: 'title',
    task_title: 'title',
    desc: 'description',
    details: 'description'
  };

  Object.entries(fieldMappings).forEach(([oldKey, newKey]) => {
    if (raw[oldKey] && !raw[newKey]) {
      normalized[newKey] = raw[oldKey];
    }
  });

  // Normalize string values
  if (typeof normalized.status === "string") {
    normalized.status = normalized.status.toLowerCase().trim();
  }
  if (typeof normalized.priority === "string") {
    normalized.priority = normalized.priority.toLowerCase().trim();
  }
  if (typeof normalized.title === "string") {
    normalized.title = normalized.title.trim();
  }
  if (typeof normalized.description === "string") {
    normalized.description = normalized.description.trim();
  }

  console.log("[Validation] Normalized result:", normalized);
  return normalized;
}

export function coerceTaskValues(parsed: any) {
  const statusParse = StatusEnum.safeParse(parsed.status);
  const priorityParse = PriorityEnum.safeParse(parsed.priority);

  const result = {
    title: parsed.title || "Untitled Task",
    description: parsed.description || "",
    status: statusParse.success ? statusParse.data : "open",
    priority: priorityParse.success ? priorityParse.data : "medium",
    created_at: new Date().toISOString(),
    ...parsed,
  };
  
  console.log("[Validation] Coerced values:", result);
  return result;
}
```

### Phase 4: Database Schema Verification

**File**: `sql/verify_schema.sql`
```sql
-- Run this to verify your schema
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;
```

**File**: `sql/2025-08-29_add_default_priority_status.sql`
```sql
-- Check if columns exist first
DO $$ 
BEGIN
    -- Add defaults if columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
        ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'open';
        UPDATE tasks SET status = 'open' WHERE status IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'priority') THEN
        ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'medium';
        UPDATE tasks SET priority = 'medium' WHERE priority IS NULL;
    END IF;
END $$;

-- Verify the changes
SELECT column_name, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name IN ('status', 'priority');
```

## Testing & Verification Steps

### 1. Manual Testing Sequence
```bash
# 1. Test environment
curl http://localhost:3000/api/debug/supabase

# 2. Test task creation with minimal payload
curl -X POST http://localhost:3000/api/tasks/auto-create \
  -H "Content-Type: application/json" \
  -d '{}'

# 3. Test with complete payload
curl -X POST http://localhost:3000/api/tasks/auto-create \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test description"}'

# 4. Check server logs for detailed error info
```

### 2. Enhanced Playwright Tests

**File**: `tests/task-creation-debug.spec.ts`
```typescript
import { test, expect } from "@playwright/test";

test.describe("Task creation debugging", () => {
  test("Environment and API health check", async ({ request }) => {
    // Test debug endpoint
    const debugResponse = await request.get("/api/debug/supabase");
    const debugData = await debugResponse.json();
    console.log("Debug data:", debugData);
    
    expect(debugResponse.ok()).toBeTruthy();
    expect(debugData.environment.SUPABASE_URL).toBeTruthy();
    expect(debugData.connection.success).toBeTruthy();
  });

  test("API task creation with detailed logging", async ({ request }) => {
    const response = await request.post("/api/tasks/auto-create", {
      data: { title: "Test Task", description: "Auto-generated task" }
    });
    
    const responseBody = await response.json();
    console.log("API Response:", responseBody);
    
    if (!response.ok()) {
      console.error("API Error Details:", responseBody);
    }
    
    expect(response.ok()).toBeTruthy();
    expect(responseBody.data).toBeDefined();
    expect(responseBody.source).toBe("db");
  });
});
```

## Common Issues & Solutions

### Issue 1: "Unknown error" 500s
**Likely causes:**
- Missing environment variables
- Supabase client not initialized
- Database connection issues
- RLS (Row Level Security) blocking inserts

**Debug steps:**
1. Check `/api/debug/supabase` endpoint
2. Verify `.env.local` has correct values
3. Check Supabase project settings
4. Verify table exists and service role has permissions

### Issue 2: Validation errors
**Debug with:**
```javascript
// Add this to your validation function
console.log("Raw input:", JSON.stringify(raw, null, 2));
console.log("Schema parse result:", CreateTaskSchema.safeParse(normalized));
```

### Issue 3: Database permissions
**Check with:**
```sql
-- In Supabase SQL editor
SELECT * FROM information_schema.table_privileges 
WHERE table_name = 'tasks' AND grantee = 'service_role';
```

## Acceptance Criteria Checklist

- [ ] Enhanced error logging shows exact failure point
- [ ] Environment validation prevents startup with missing vars  
- [ ] All mock fallback code removed
- [ ] Database-only task creation works
- [ ] Structured error responses (not "Unknown error")
- [ ] SQL migration applied and tested
- [ ] Playwright tests pass with detailed logging
- [ ] Manual API testing successful

## Emergency Rollback Plan

If issues persist, you can temporarily add a health check that prevents the API from running:

```typescript
// Add to top of API handler
const healthCheck = await testSupabaseConnection();
if (!healthCheck.success) {
  return res.status(503).json({ 
    error: "SERVICE_UNAVAILABLE", 
    details: "Database connection failed",
    healthCheck 
  });
}
```