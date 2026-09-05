import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { getSessionUserId } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId || !mongoose.isValidObjectId(sessionUserId)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) return NextResponse.json({ users: [] });

    await connectDB();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    const users = await User.find({
      _id: { $ne: sessionUserId },
      $or: [{ nitraId: regex }, { name: regex }, { email: regex }, { phone: regex }],
    }).select("name email phone nitraId initials bio status avatarUrl").limit(12).lean();

    return NextResponse.json({ users: users.map((user) => ({ id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, nitraId: user.nitraId, initials: user.initials, bio: user.bio, status: user.status, avatarUrl: user.avatarUrl })) });
  } catch (error) {
    console.error("Nitra user search failed", error);
    return NextResponse.json({ error: "Unable to search Nitra right now." }, { status: 500 });
  }
}
