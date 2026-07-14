import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const status = searchParams.get("status"); // SUCCESS | FAILED | null for all

  const user = await prisma.user.findUnique({
    where: { publicKey: session.publicKey },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const where = {
    userId: user.id,
    ...(status ? { status } : {}),
  };

  const [logs, total] = await prisma.$transaction([
    prisma.transactionLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        monitoredKey: { select: { contractId: true } },
      },
    }),
    prisma.transactionLog.count({ where }),
  ]);

  return NextResponse.json({
    logs: logs.map((log) => ({
      id: log.id,
      contractId: log.monitoredKey?.contractId ?? "Unknown",
      status: log.status,
      xlmCost: log.xlmCost?.toString() ?? null,
      extendedTo: log.extendedTo,
      txHash: log.txHash,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
