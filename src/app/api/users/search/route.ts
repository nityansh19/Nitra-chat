import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (q.length < 2) {
      return NextResponse.json({ users: [] });
    }

    await connectDB();

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const users = await User.find({
      $or: [{ nitraId: regex }, { name: regex }, { email: regex }, { phone: regex }],
    })
      .select("name email phone nitraId initials bio status")
      .limit(12)
      .lean();

    return NextResponse.json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        nitraId: user.nitraId,
        initials: user.initials,
        bio: user.bio,
        status: user.status,
      })),
    });
  } catch (error) {
    console.error("Nitra user search failed", error);
    return NextResponse.json({ error: "Unable to search Nitra right now." }, { status: 500 });
  }
}
