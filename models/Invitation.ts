import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInvitation extends Document {
  token: string;
  projectId: Types.ObjectId;
  inviterId: Types.ObjectId;
  inviteeEmail: string;
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt: Date;
  createdAt: Date;
}

const InvitationSchema: Schema = new Schema(
  {
    token: {
      type: String,
      required: [true, "Invitation token is required"],
      unique: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    inviterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Inviter is required"],
    },
    inviteeEmail: {
      type: String,
      required: [true, "Invitee email is required"],
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
InvitationSchema.index({ token: 1, status: 1 });
InvitationSchema.index({ inviteeEmail: 1, status: 1 });
InvitationSchema.index({ projectId: 1, status: 1 });

const Invitation: Model<IInvitation> =
  mongoose.models.Invitation ||
  mongoose.model<IInvitation>("Invitation", InvitationSchema);

export default Invitation;
