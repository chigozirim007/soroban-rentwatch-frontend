import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decimalToString } from "@/lib/format";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { publicKey: session.publicKey },
    include: {
      balancePool: true,
      deposits: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    xlmBalance: decimalToString(user.balancePool?.xlmBalance),
    depositMemo: user.depositMemo,
    depositAccount:
      process.env.DEPOSIT_ACCOUNT_PUBLIC ??
      process.env.NEXT_PUBLIC_DEPOSIT_ACCOUNT ??
      "",
    deposits: user.deposits.map((deposit) => ({
      id: deposit.id,
      amount: decimalToString(deposit.amount),
      txHash: deposit.txHash,
      sourceAccount: deposit.sourceAccount,
      ledgerSeq: deposit.ledgerSeq,
      memo: deposit.memo,
      createdAt: deposit.createdAt.toISOString(),
    })),
  });
}
