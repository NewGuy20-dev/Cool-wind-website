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
