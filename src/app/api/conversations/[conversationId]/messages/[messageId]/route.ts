import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Message } from "@/lib/models/Message";
import { getSessionUserId } from "@/lib/auth";

async function getOwnedMessage(conversationId: string, messageId: string) {
  const userId = await getSessionUserId();
  if (!userId || !mongoose.isValidObjectId(conversationId) || !mongoose.isValidObjectId(messageId)) return null;
  return Message.findOne({ _id: messageId, conversationId, senderId: userId });
}

export async function PATCH(request: Request, context: { params: Promise<{ conversationId: string; messageId: string }> }) {
  try {
    const { conversationId, messageId } = await context.params;
    const message = await getOwnedMessage(conversationId, messageId);
    if (!message) return NextResponse.json({ error: "Message not found or unauthorized." }, { status: 404 });
    const body = await request.json();
    if (body.text !== undefined) {
      if (typeof body.text !== "string" || !body.text.trim() || body.text.trim().length > 4000) return NextResponse.json({ error: "Message must contain 1–4000 characters." }, { status: 400 });
      message.text = body.text.trim();
      message.editedAt = new Date();
    }
    if (body.deleted === true) {
      message.deletedAt = new Date();
      message.text = "This message was deleted.";
    }
    await message.save();
    return NextResponse.json({ message });
  } catch (error) {
    console.error("Message update failed", error);
    return NextResponse.json({ error: "Unable to update message." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ conversationId: string; messageId: string }> }) {
  try {
    const { conversationId, messageId } = await context.params;
    const message = await getOwnedMessage(conversationId, messageId);
    if (!message) return NextResponse.json({ error: "Message not found or unauthorized." }, { status: 404 });
    message.deletedAt = new Date();
    message.text = "This message was deleted.";
    await message.save();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Message deletion failed", error);
    return NextResponse.json({ error: "Unable to delete message." }, { status: 500 });
  }
}
