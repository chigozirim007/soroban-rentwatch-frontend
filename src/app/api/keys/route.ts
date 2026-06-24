import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publicKey = searchParams.get("publicKey");

  if (!publicKey) {
    return NextResponse.json({ error: "publicKey is required" }, { status: 400 });
  }

  // TODO: Fetch from Prisma with JOIN to monitoredKey
  // const keys = await prisma.monitoredKey.findMany({ where: { user: { publicKey } } });

  return NextResponse.json({
    keys: [
      {
        id: "key-1",
        contractId: "CABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF12",
        storageKind: "INSTANCE",
        status: "HEALTHY",
        remaining: 85420,
        thresholdLedgers: 15000,
        extendToLedgers: 100000,
        liveUntilLedger: 1085420,
        lastCheckedLedger: 1000000,
        updatedAt: new Date().toISOString(),
      },
    ],
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { publicKey, contractId, storageKind, targetKeyXdr, thresholdLedgers, extendToLedgers } = body;

  if (!publicKey || !contractId || !storageKind) {
    return NextResponse.json({ error: "publicKey, contractId, storageKind are required" }, { status: 400 });
  }

  // TODO: Create in Prisma — auto-generate XDR if not provided
  // const key = await prisma.monitoredKey.create({ data: { ... } });

  return NextResponse.json({
    id: "new-key-uuid",
    contractId,
    storageKind,
    status: "HEALTHY",
    thresholdLedgers: thresholdLedgers ?? 15000,
    extendToLedgers: extendToLedgers ?? 100000,
    createdAt: new Date().toISOString(),
  }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("id");

  if (!keyId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // TODO: Delete from Prisma
  // await prisma.monitoredKey.delete({ where: { id: keyId } });

  return NextResponse.json({ success: true });
}
