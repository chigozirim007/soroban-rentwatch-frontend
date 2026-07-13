import { NextRequest, NextResponse } from "next/server";
import { createSession, verifySignature } from "@/lib/auth";
import { isValidPublicKey } from "@/lib/soroban";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicKey, message, signature } = body;

    if (!publicKey || !isValidPublicKey(publicKey)) {
      return NextResponse.json({ error: "Valid publicKey is required" }, { status: 400 });
    }

    if (!message || !signature) {
      return NextResponse.json({ error: "Message and signature are required" }, { status: 400 });
    }

    // Verify the signature against the public key
    const isValid = verifySignature(publicKey, message, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Auto-register user if they don't exist
    let user = await prisma.user.findUnique({ where: { publicKey } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          publicKey,
          depositMemo: crypto.randomBytes(16).toString("hex").slice(0, 16), // simplified memo gen
        },
      });
    }

    // Issue JWT cookie
    const token = await createSession(publicKey);
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("rw_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("rw_session");
  return NextResponse.json({ success: true });
}
