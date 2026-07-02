import { PrismaClient } from '@prisma/client';

// ─── Prisma Singleton for Next.js ────────────────────────────
//
// Next.js dev mode creates multiple module instances via hot
// reload. Without this pattern, each reload opens a new DB
// connection pool and you quickly exhaust max_connections.
//
// The client uses the backend prisma/schema.prisma — the
// postinstall script runs: npx prisma generate --schema=../backend/prisma/schema.prisma
// DATABASE_URL must be set in frontend/.env.local.
// ─────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

// Prevent hot-reload from spawning multiple clients in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
