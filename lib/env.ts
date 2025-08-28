/**
 * Strict Environment Variable Validation
 * Provides type-safe access to environment variables with validation
 */

import { z } from "zod";

// Environment schema with strict validation
const EnvSchema = z.object({
  SUPABASE_URL: z.string().url("Must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "Anon key required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Service role key required"),
  USE_MOCK_DATA: z.string().optional().default("false"),
  NODE_ENV: z.string().optional().default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

// Lazy validation - only validate when accessed
let envValidated: boolean | null = null;
let validationError: string | null = null;

function validateEnvironmentLazy(): boolean {
  if (envValidated !== null) {
    return envValidated;
  }

  try {
    EnvSchema.parse({
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      USE_MOCK_DATA: process.env.USE_MOCK_DATA,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    });
    envValidated = true;
    return true;
  } catch (error) {
    envValidated = false;
    if (error instanceof z.ZodError) {
      validationError = `Environment validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
    } else {
      validationError = `Environment validation failed: ${error}`;
    }
    return false;
  }
}

/**
 * Type-safe environment variable getters
 * These will throw if environment validation failed
 */
export const env = {
  get SUPABASE_URL(): string {
    if (!validateEnvironmentLazy()) {
      throw new Error(validationError || "Environment not validated");
    }
    return process.env.NEXT_PUBLIC_SUPABASE_URL!;
  },

  get SUPABASE_ANON_KEY(): string {
    if (!validateEnvironmentLazy()) {
      throw new Error(validationError || "Environment not validated");
    }
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  },

  get SUPABASE_SERVICE_ROLE_KEY(): string {
    if (!validateEnvironmentLazy()) {
      throw new Error(validationError || "Environment not validated");
    }
    return process.env.SUPABASE_SERVICE_ROLE_KEY!;
  },

  get USE_MOCK_DATA(): boolean {
    return process.env.USE_MOCK_DATA === "true";
  },

  get NODE_ENV(): string {
    return process.env.NODE_ENV || "development";
  },

  get NEXT_PUBLIC_SITE_URL(): string | undefined {
    return process.env.NEXT_PUBLIC_SITE_URL;
  },

  get IS_PRODUCTION(): boolean {
    return this.NODE_ENV === "production";
  },

  get IS_DEVELOPMENT(): boolean {
    return this.NODE_ENV === "development";
  },
};

/**
 * Get environment variable presence (for debugging without exposing secrets)
 */
export function getEnvPresence() {
  return {
    SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    USE_MOCK_DATA: process.env.USE_MOCK_DATA || "false",
    NODE_ENV: process.env.NODE_ENV || "development",
    NEXT_PUBLIC_SITE_URL: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    validationStatus: envValidated ? "valid" : "invalid",
    validationError: validationError,
  };
}

/**
 * Validate environment for health checks
 */
export function validateEnvironment(): { valid: boolean; error?: string } {
  const isValid = validateEnvironmentLazy();
  if (!isValid) {
    return { valid: false, error: validationError || "Unknown validation error" };
  }
  return { valid: true };
}

/**
 * Development helper to display environment status
 */
export function logEnvironmentStatus() {
  if (!env.IS_PRODUCTION) {
    const status = getEnvPresence();
    console.log("🔧 Environment Status:", {
      ...status,
      // Don't log actual values in production
      timestamp: new Date().toISOString(),
    });
  }
}