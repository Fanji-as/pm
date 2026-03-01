import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Project from "@/models/Project";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import { sendEmail, generateInvitationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Only the owner can invite members" },
        { status: 403 },
      );
    }

    const userToInvite = await User.findOne({ email });

    if (userToInvite) {
      if (project.members.includes(userToInvite._id)) {
        return NextResponse.json(
          { error: "User is already a member" },
          { status: 400 },
        );
      }
    }

    const invitationToken = require("node:crypto")
      .randomBytes(32)
      .toString("hex");

    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitationToken}`;

    try {
      const inviter = await User.findById(decoded.userId);
      if (inviter) {
        const { html, text } = generateInvitationEmail(
          project.name,
          inviter.name,
          invitationLink,
        );

        await sendEmail({
          to: email,
          subject: `You're invited to join "${project.name}"`,
          html,
          text,
        });
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return NextResponse.json({
      success: true,
      invitationLink,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 },
    );
  }
}