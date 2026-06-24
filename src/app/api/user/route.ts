import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publicKey = searchParams.get("publicKey");

  if (!publicKey) {
    return NextResponse.json({ error: "publicKey is required" }, { status: 400 });
  }

  // TODO: Connect to Prisma and fetch real data
  // const user = await prisma.user.findUnique({ where: { publicKey } });

  // Demo response
  return NextResponse.json({
    id: "demo-uuid",
    publicKey,
    depositMemo: "a1b2c3d4e5f6g7h8",
    webhookUrl: null,
    createdAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { publicKey, webhookUrl } = body;

  if (!publicKey) {
    return NextResponse.json({ error: "publicKey is required" }, { status: 400 });
  }

  // Validate Stellar public key format
  if (!publicKey.startsWith("G") || publicKey.length !== 56) {
    return NextResponse.json({ error: "Invalid Stellar public key" }, { status: 400 });
  }

  // TODO: Create user in Prisma + generate deposit memo
  // const depositMemo = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  // const user = await prisma.user.create({ data: { publicKey, depositMemo, webhookUrl } });

  return NextResponse.json({
    id: "new-uuid",
    publicKey,
    depositMemo: "a1b2c3d4e5f6g7h8",
    webhookUrl: webhookUrl ?? null,
    createdAt: new Date().toISOString(),
  }, { status: 201 });
}
