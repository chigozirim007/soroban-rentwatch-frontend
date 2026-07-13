import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { publicKey: session.publicKey },
    select: { webhookUrl: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ webhookUrl: user.webhookUrl ?? "" });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { webhookUrl } = body ?? {};

  const user = await prisma.user.findUnique({
    where: { publicKey: session.publicKey },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { publicKey: session.publicKey },
    data: {
      webhookUrl: webhookUrl ?? null,
    },
  });

  return NextResponse.json({ success: true, updated: { webhookUrl } });
}
