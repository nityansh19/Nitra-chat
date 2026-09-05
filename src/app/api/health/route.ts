import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ ok: true, database: "connected" });
  } catch (error) {
    console.error("Nitra health check failed", error);
    return NextResponse.json(
      { ok: false, database: "disconnected", error: "Database connection failed" },
      { status: 503 },
    );
  }
}
