import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/Conversation";
import { Message } from "@/lib/models/Message";
import { getSessionUserId } from "@/lib/auth";

async function authorizedConversation(conversationId: string) {
  const userId = await getSessionUserId();
  if (!userId || !mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(conversationId)) return null;
  await connectDB();
  return Conversation.findOne({ _id: conversationId, participants: userId });
}

export async function GET(_request: Request, context: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await context.params;
    const conversation = await authorizedConversation(conversationId);
    if (!conversation) return NextResponse.json({ error: "Conversation not found or unauthorized." }, { status: 404 });
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).populate("senderId", "name nitraId initials avatarUrl").lean();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Message list failed", error);
    return NextResponse.json({ error: "Unable to load messages." }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await context.params;
    const conversation = await authorizedConversation(conversationId);
    if (!conversation) return NextResponse.json({ error: "Conversation not found or unauthorized." }, { status: 404 });
    const userId = await getSessionUserId();
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text || text.length > 4000) return NextResponse.json({ error: "Message must contain 1–4000 characters." }, { status: 400 });
    const replyToId = body.replyToId && mongoose.isValidObjectId(body.replyToId) ? body.replyToId : null;
    if (replyToId) {
      const reply = await Message.findOne({ _id: replyToId, conversationId }).lean();
      if (!reply) return NextResponse.json({ error: "Reply target not found." }, { status: 400 });
    }

    const message = await Message.create({ conversationId, senderId: userId, text, replyToId });
    conversation.lastMessage = message._id;
    await conversation.save();
    const populated = await Message.findById(message._id).populate("senderId", "name nitraId initials avatarUrl").lean();
    return NextResponse.json({ message: populated }, { status: 201 });
  } catch (error) {
    console.error("Message creation failed", error);
    return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
  }
}
