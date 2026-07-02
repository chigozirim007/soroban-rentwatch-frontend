import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateDepositMemo, isValidPublicKey } from "@/lib/soroban";
import { decimalToString } from "@/lib/format";

function serializeUser(user: Awaited<ReturnType<typeof findUser>>) {
  if (!user) return null;

  return {
    id: user.id,
    publicKey: user.publicKey,
    depositMemo: user.depositMemo,
    webhookUrl: user.webhookUrl,
    createdAt: user.createdAt.toISOString(),
    balance: decimalToString(user.balancePool?.xlmBalance),
    counts: {
      monitoredKeys: user._count.keys,
      deposits: user._count.deposits,
      transactions: user._count.txLogs,
    },
  };
}

function findUser(publicKey: string) {
  return prisma.user.findUnique({
    where: { publicKey },
    include: {
      balancePool: true,
      _count: { select: { keys: true, deposits: true, txLogs: true } },
    },
  });
}

async function createUser(publicKey: string, webhookUrl?: string | null) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.user.create({
        data: {
          publicKey,
          depositMemo: generateDepositMemo(),
          webhookUrl: webhookUrl || null,
          balancePool: { create: { xlmBalance: 0 } },
        },
        include: {
          balancePool: true,
          _count: { select: { keys: true, deposits: true, txLogs: true } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes("deposit_memo")
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Could not generate a unique deposit memo");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const publicKey = searchParams.get("publicKey");

  if (!publicKey || !isValidPublicKey(publicKey)) {
    return NextResponse.json({ error: "A valid Stellar publicKey is required" }, { status: 400 });
  }

  const user = await findUser(publicKey);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: serializeUser(user) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const publicKey = body?.publicKey;
  const webhookUrl = typeof body?.webhookUrl === "string" ? body.webhookUrl.trim() : null;

  if (!publicKey || !isValidPublicKey(publicKey)) {
    return NextResponse.json({ error: "A valid Stellar publicKey is required" }, { status: 400 });
  }

  const existing = await findUser(publicKey);
  if (existing) {
    return NextResponse.json({ user: serializeUser(existing), created: false });
  }

  const user = await createUser(publicKey, webhookUrl);
  return NextResponse.json({ user: serializeUser(user), created: true }, { status: 201 });
}
