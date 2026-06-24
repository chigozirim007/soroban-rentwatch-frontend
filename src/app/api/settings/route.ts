import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { publicKey, webhookUrl, thresholdLedgers, extendToLedgers } = body;

  if (!publicKey) {
    return NextResponse.json({ error: "publicKey is required" }, { status: 400 });
  }

  // TODO: Update user settings in Prisma
  // const user = await prisma.user.update({ where: { publicKey }, data: { webhookUrl } });

  return NextResponse.json({
    success: true,
    updated: { webhookUrl, thresholdLedgers, extendToLedgers },
  });
}
