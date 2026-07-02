
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── DB Health Check ─────────────────────────────────────────
// GET /api/test-db
// Verifies the frontend Prisma client can reach PostgreSQL.
// Returns counts for key models and connection latency.
// Safe to call at any time — read-only.
// ─────────────────────────────────────────────────────────────

export async function GET() {
  const start = Date.now();

  try {
    // Parallel reads across core models to confirm Prisma is wired up
    const [userCount, keyCount, txCount, depositCount, relayerKeyCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.monitoredKey.count(),
        prisma.transactionLog.count(),
        prisma.depositLog.count(),
        prisma.relayerKey.count(),
      ]);

    const latencyMs = Date.now() - start;

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL connected via Prisma (frontend API routes)',
      latencyMs,
      counts: {
        users: userCount,
        monitoredKeys: keyCount,
        transactionLogs: txCount,
        depositLogs: depositCount,
        relayerKeys: relayerKeyCount,
      },
      databaseUrl: process.env.DATABASE_URL
        ? `postgresql://***@${process.env.DATABASE_URL.split('@')[1]}`
        : 'NOT SET',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[/api/test-db] Database connection failed:', message);

    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        details: message,
        hint: 'Is DATABASE_URL set in frontend/.env.local? Is Postgres running?',
      },
      { status: 500 },
    );
  }
}
