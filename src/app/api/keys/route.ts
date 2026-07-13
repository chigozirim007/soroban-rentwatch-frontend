import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateInstanceKeyXdr,
  generatePersistentDataKeyXdr,
  isValidContractId,
} from "@/lib/soroban";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { publicKey: session.publicKey },
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
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { contractId, storageKind, targetKeyXdr, symbol, thresholdLedgers, extendToLedgers } =
    body ?? {};

  if (!contractId || !storageKind) {
    return NextResponse.json(
      { error: "contractId, storageKind are required" },
      { status: 400 }
    );
  }

  if (!isValidContractId(contractId)) {
    return NextResponse.json(
      { error: "Invalid contract ID — must be a valid Soroban contract address (C...)" },
      { status: 400 }
    );
  }

  if (storageKind === "PERSISTENT" && !symbol && !targetKeyXdr) {
    return NextResponse.json(
      { error: "symbol is required for PERSISTENT storage kind" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { publicKey: session.publicKey },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found — connect wallet first" }, { status: 404 });
  }

  // Generate real Soroban XDR
  let resolvedXdr: string;
  if (targetKeyXdr) {
    resolvedXdr = targetKeyXdr;
  } else if (storageKind === "INSTANCE" || storageKind === "CONTRACT_CODE") {
    resolvedXdr = generateInstanceKeyXdr(contractId);
  } else {
    // PERSISTENT — requires a symbol
    resolvedXdr = generatePersistentDataKeyXdr(contractId, symbol);
  }

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
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get("id");

  if (!keyId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const key = await prisma.monitoredKey.findFirst({
    where: { id: keyId, user: { publicKey: session.publicKey } },
    select: { id: true },
  });

  if (!key) {
    return NextResponse.json({ error: "Key not found or not owned by this user" }, { status: 404 });
  }

  await prisma.monitoredKey.delete({ where: { id: keyId } });
  return NextResponse.json({ success: true });
}
