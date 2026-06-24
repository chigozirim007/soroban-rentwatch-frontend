import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publicKey = searchParams.get("publicKey");

  if (!publicKey) {
    return NextResponse.json({ error: "publicKey is required" }, { status: 400 });
  }

  // TODO: Fetch from Prisma
  // const user = await prisma.user.findUnique({ where: { publicKey }, include: { balancePool: true, deposits: ... } });

  return NextResponse.json({
    xlmBalance: "4.2000000",
    depositMemo: "a1b2c3d4e5f6g7h8",
    depositAccount: process.env.DEPOSIT_ACCOUNT_PUBLIC ?? "",
    deposits: [
      { id: "dep-1", amount: "5.0000000", txHash: "aabbcc", sourceAccount: "GABC...D1F2", createdAt: new Date().toISOString() },
      { id: "dep-2", amount: "10.0000000", txHash: "ddeeff", sourceAccount: "GABC...D1F2", createdAt: new Date().toISOString() },
    ],
  });
}
