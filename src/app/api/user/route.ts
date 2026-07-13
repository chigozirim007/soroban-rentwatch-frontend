import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { publicKey } = session;

  const user = await prisma.user.findUnique({
    where: { publicKey },
    include: {
      balancePool: true,
      _count: { select: { keys: true, deposits: true, txLogs: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      publicKey: user.publicKey,
      depositMemo: user.depositMemo,
      webhookUrl: user.webhookUrl,
      xlmBalance: user.balancePool?.xlmBalance?.toString() ?? "0",
      createdAt: user.createdAt,
      counts: {
        monitoredKeys: user._count.keys,
        deposits: user._count.deposits,
        transactions: user._count.txLogs,
      },
    },
  });
}
