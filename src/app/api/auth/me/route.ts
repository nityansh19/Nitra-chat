import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId || !mongoose.isValidObjectId(userId)) return NextResponse.json({ user: null }, { status: 401 });
    await connectDB();
    const user = (await User.findById(userId).lean()) as any;
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, nitraId: user.nitraId, initials: user.initials, bio: user.bio, status: user.status, avatarUrl: user.avatarUrl, privacy: user.privacy } });
  } catch (error) {
    console.error("Nitra session lookup failed", error);
    return NextResponse.json({ error: "Unable to load the session." }, { status: 500 });
  }
}
