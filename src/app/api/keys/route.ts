import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publicKey = searchParams.get("publicKey");

  if (!publicKey) {
    return NextResponse.json({ error: "publicKey is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { publicKey },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const keys = await prisma.monitoredKey.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      contractId: true,
      storageKind: true,
      status: true,
      thresholdLedgers: true,
      extendToLedgers: true,
      liveUntilLedger: true,
      lastCheckedLedger: true,
      updatedAt: true,
    },
  });

  const serialized = keys.map((k) => ({
    ...k,
    updatedAt: k.updatedAt.toISOString(),
    remaining:
      k.liveUntilLedger !== null && k.lastCheckedLedger !== null
        ? Math.max(0, k.liveUntilLedger - k.lastCheckedLedger)
        : null,
  }));

  return NextResponse.json({ keys: serialized });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { publicKey, contractId, storageKind, targetKeyXdr, thresholdLedgers, extendToLedgers } =
    body ?? {};

  if (!publicKey || !contractId || !storageKind) {
    return NextResponse.json(
      { error: "publicKey, contractId, storageKind are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { publicKey },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found — connect wallet first" }, { status: 404 });
  }

  // Derive a default XDR key for INSTANCE / CONTRACT_CODE if none provided
  const resolvedXdr =
    targetKeyXdr ||
    (storageKind === "INSTANCE"
      ? Buffer.from(`instance:${contractId}`).toString("base64")
      : Buffer.from(`code:${contractId}`).toString("base64"));

  const key = await prisma.monitoredKey.create({
    data: {
      userId: user.id,
      contractId,
      storageKind,
      targetKeyXdr: resolvedXdr,
      thresholdLedgers: thresholdLedgers ?? 15000,
      extendToLedgers: extendToLedgers ?? 100000,
    },
  });

  return NextResponse.json(
    {
      id: key.id,
      contractId: key.contractId,
      storageKind: key.storageKind,
      status: key.status,
      thresholdLedgers: key.thresholdLedgers,
      extendToLedgers: key.extendToLedgers,
      createdAt: key.updatedAt.toISOString(),
    },
    { status: 201 }
  );
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("id");
  const publicKey = searchParams.get("publicKey");

  if (!keyId || !publicKey) {
    return NextResponse.json({ error: "id and publicKey are required" }, { status: 400 });
  }

  // Verify ownership before deleting
  const key = await prisma.monitoredKey.findFirst({
    where: { id: keyId, user: { publicKey } },
    select: { id: true },
  });

  if (!key) {
    return NextResponse.json({ error: "Key not found or not owned by this user" }, { status: 404 });
  }

  await prisma.monitoredKey.delete({ where: { id: keyId } });
  return NextResponse.json({ success: true });
}
