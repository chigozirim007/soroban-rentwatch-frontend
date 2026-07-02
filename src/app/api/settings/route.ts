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
    select: { webhookUrl: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ webhookUrl: user.webhookUrl ?? "" });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { publicKey, webhookUrl } = body ?? {};

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

  await prisma.user.update({
    where: { publicKey },
    data: {
      webhookUrl: webhookUrl ?? null,
    },
  });

  return NextResponse.json({ success: true, updated: { webhookUrl } });
}
