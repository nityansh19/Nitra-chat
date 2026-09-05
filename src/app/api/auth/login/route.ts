import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === "string" ? body.identifier.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!identifier || !password) return NextResponse.json({ error: "Email/phone and password are required." }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await createSession(user._id.toString());
    return NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, nitraId: user.nitraId, initials: user.initials, bio: user.bio, status: user.status, avatarUrl: user.avatarUrl, privacy: user.privacy } });
  } catch (error) {
    console.error("Nitra login failed", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
