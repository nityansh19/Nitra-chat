import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    nitraId: { type: String, required: true, unique: true, index: true },
    initials: { type: String, required: true, maxlength: 3 },
    bio: { type: String, default: "", maxlength: 180 },
    status: { type: String, default: "Available", maxlength: 80 },
    avatarUrl: { type: String, default: "" },
    privacy: {
      profileVisibility: { type: String, enum: ["everyone", "contacts", "nobody"], default: "everyone" },
      activityStatus: { type: Boolean, default: true },
      readReceipts: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof UserSchema>;

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
