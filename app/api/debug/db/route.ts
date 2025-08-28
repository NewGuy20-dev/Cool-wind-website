/**
 * Database Debug API Endpoint
 * Provides comprehensive database health and connectivity information
 */

import { NextResponse } from 'next/server';
import { getDatabaseHealthStatus, testDatabaseConnection } from '@/lib/supabase/server';
import { getEnvPresence, validateEnvironment } from '@/lib/env';

export async function GET() {
  try {
    const envValidation = validateEnvironment();
    const envStatus = getEnvPresence();
    
    // If environment validation failed, return early
    if (!envValidation.valid) {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        service: {
          name: "task-management-system",
          status: "environment_error",
        },
        environment: {
          ...envStatus,
          validationError: envValidation.error,
        },
        database: {
          connected: false,
          error: {
            type: "ENVIRONMENT_ERROR",
            message: "Environment validation failed",
            details: envValidation.error,
          },
        },
      }, { status: 500 });
    }

    // Test database connectivity
    const connectionTest = await testDatabaseConnection();
    const healthStatus = await getDatabaseHealthStatus();
    
    // Determine overall status
    const overallStatus = connectionTest.connected ? "healthy" : "unhealthy";
    const statusCode = connectionTest.connected ? 200 : 500;
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      service: {
        name: "task-management-system",
        version: "1.0.0",
        status: overallStatus,
      },
      environment: envStatus,
      database: {
        connected: connectionTest.connected,
        latency: connectionTest.latency,
        error: connectionTest.error || null,
        testQuery: connectionTest.testQuery,
      },
      connectivity: {
        supabaseAdmin: {
          configured: Boolean(envStatus.SUPABASE_URL && envStatus.SUPABASE_SERVICE_ROLE_KEY),
          tested: true,
          result: connectionTest.connected ? "success" : "failure",
        },
      },
      recommendations: overallStatus === "unhealthy" ? [
        "Check your SUPABASE_URL environment variable",
        "Verify SUPABASE_SERVICE_ROLE_KEY is correct",
        "Ensure your Supabase project is active",
        "Check network connectivity to Supabase",
        "Verify the 'tasks' table exists in your database",
      ] : [],
    }, { status: statusCode });
    
  } catch (error: any) {
    console.error("❌ [DEBUG] Database health check failed:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      service: {
        name: "task-management-system",
        status: "error",
      },
      environment: getEnvPresence(),
      database: {
        connected: false,
        error: {
          type: "HEALTH_CHECK_ERROR",
          message: error.message || "Unknown error during health check",
        },
      },
      error: {
        type: "UNEXPECTED_ERROR",
        message: "Health check endpoint failed",
        details: error.message,
      },
    }, { status: 500 });
  }
}

// Also handle POST for triggering manual health checks
export async function POST() {
  return GET();
}