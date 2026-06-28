import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      success: true,
      message: "Successfully connected to PostgreSQL via Prisma in Frontend API",
      userCount
    });
  } catch (error: any) {
    console.error("Database connection failed:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed", details: error.message },
      { status: 500 }
    );
  }
}
