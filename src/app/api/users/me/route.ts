import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { getSessionUserId } from "@/lib/auth";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "N";
}

function publicUser(user: any) {
  return { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, nitraId: user.nitraId, initials: user.initials, bio: user.bio, status: user.status, avatarUrl: user.avatarUrl, privacy: user.privacy };
}

async function currentUser() {
  const id = await getSessionUserId();
  if (!id || !mongoose.isValidObjectId(id)) return null;
  await connectDB();
  return User.findById(id);
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    return NextResponse.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Profile lookup failed", error);
    return NextResponse.json({ error: "Unable to load profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await request.json();

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length < 2 || name.length > 60) return NextResponse.json({ error: "Name must be 2–60 characters." }, { status: 400 });
      user.name = name;
      user.initials = initials(name);
    }
    if (body.bio !== undefined) {
      if (typeof body.bio !== "string" || body.bio.length > 180) return NextResponse.json({ error: "Bio must be 180 characters or less." }, { status: 400 });
      user.bio = body.bio.trim();
    }
    if (body.status !== undefined) {
      if (typeof body.status !== "string" || body.status.length > 80) return NextResponse.json({ error: "Status must be 80 characters or less." }, { status: 400 });
      user.status = body.status.trim();
    }
    if (body.avatarUrl !== undefined) {
      if (typeof body.avatarUrl !== "string" || body.avatarUrl.length > 2_800_000) return NextResponse.json({ error: "Profile image is too large." }, { status: 400 });
      if (body.avatarUrl && !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(body.avatarUrl)) return NextResponse.json({ error: "Unsupported profile image format." }, { status: 400 });
      user.avatarUrl = body.avatarUrl;
    }
    if (body.privacy && typeof body.privacy === "object") {
      if (body.privacy.profileVisibility && ["everyone", "contacts", "nobody"].includes(body.privacy.profileVisibility)) user.privacy.profileVisibility = body.privacy.profileVisibility;
      if (typeof body.privacy.activityStatus === "boolean") user.privacy.activityStatus = body.privacy.activityStatus;
      if (typeof body.privacy.readReceipts === "boolean") user.privacy.readReceipts = body.privacy.readReceipts;
    }

    await user.save();
    return NextResponse.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Profile update failed", error);
    return NextResponse.json({ error: "Unable to update profile." }, { status: 500 });
  }
}
