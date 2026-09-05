import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { createSession } from "@/lib/auth";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "N";
}

function makeNitraId(name: string) {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 18) || "user";
  return `@${slug}_${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (name.length < 2 || name.length > 60) return NextResponse.json({ error: "Name must be 2–60 characters." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (phone.length < 7 || phone.length > 24) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must contain at least 8 characters." }, { status: 400 });

    await connectDB();
    const existing = await User.findOne({ $or: [{ email }, { phone }] }).lean();
    if (existing) return NextResponse.json({ error: `An account already exists for this ${existing.email === email ? "email" : "phone number"}.` }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    let nitraId = makeNitraId(name);
    while (await User.exists({ nitraId })) nitraId = makeNitraId(name);
    const user = await User.create({ name, email, phone, passwordHash, nitraId, initials: initials(name) });
    await createSession(user._id.toString());

    return NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, nitraId: user.nitraId, initials: user.initials, bio: user.bio, status: user.status, avatarUrl: user.avatarUrl, privacy: user.privacy } }, { status: 201 });
  } catch (error) {
    console.error("Nitra registration failed", error);
    return NextResponse.json({ error: "Unable to create the account right now." }, { status: 500 });
  }
}
