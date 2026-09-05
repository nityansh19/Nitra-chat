import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ConversationSchema = new Schema(
  {
    type: { type: String, enum: ["direct", "group"], default: "direct" },
    title: { type: String, default: "", trim: true, maxlength: 100 },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null },
  },
  { timestamps: true },
);

ConversationSchema.index({ participants: 1, updatedAt: -1 });

export type ConversationDocument = InferSchemaType<typeof ConversationSchema>;

export const Conversation =
  mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
