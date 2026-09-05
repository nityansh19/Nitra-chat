import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/Conversation";
import { User } from "@/lib/models/User";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate("participants", "name email phone nitraId initials bio status avatarUrl")
      .populate("lastMessage", "text senderId createdAt editedAt deletedAt")
      .lean();

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversation list failed", error);
    return NextResponse.json({ error: "Unable to load conversations." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const nitraId = typeof body.nitraId === "string" ? body.nitraId.trim() : "";

    if (!nitraId) {
      return NextResponse.json({ error: "A Nitra ID is required." }, { status: 400 });
    }

    await connectDB();

    const other = (await User.findOne({ nitraId }).lean()) as {
      _id: mongoose.Types.ObjectId;
    } | null;

    if (!other) {
      return NextResponse.json({ error: "Nitra user not found." }, { status: 404 });
    }

    if (other._id.toString() === userId) {
      return NextResponse.json(
        { error: "You cannot start a conversation with yourself." },
        { status: 400 }
      );
    }

    let conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [userId, other._id], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [userId, other._id],
      });
    }

    await conversation.populate(
      "participants",
      "name email phone nitraId initials bio status avatarUrl"
    );

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Conversation creation failed", error);
    return NextResponse.json({ error: "Unable to create conversation." }, { status: 500 });
  }
}
