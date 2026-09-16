import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: 'ok',
        database: 'available',
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[health] Database readiness check failed', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        status: 'unavailable',
        database: 'unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
