import { NextRequest, NextResponse } from 'next/server';
import { testSupabaseConnection } from "@/lib/supabase/server";
import { envPresence } from "@/lib/env";

export async function GET(req: NextRequest) {
  const env = envPresence();
  const connection = await testSupabaseConnection();

  return NextResponse.json({
    environment: env,
    connection,
    timestamp: new Date().toISOString()
  }, { status: 200 });
}
