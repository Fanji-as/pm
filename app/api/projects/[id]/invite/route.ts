import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Project from "@/models/Project";
import User from "@/models/User";
import Invitation from "@/models/Invitation";
import connectDB from "@/lib/mongodb";
import { sendEmail, generateInvitationEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    console.log("=== INVITE USER DEBUG START ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Project ID:", params.id);

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      console.log("ERROR: No authorization token found in headers");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Authorization token found:", token.substring(0, 20) + "...");

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      console.log("ERROR: Invalid token or no userId in decoded token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Decoded user ID:", decoded.userId);

    const { email } = await request.json();
    console.log("Email from request body:", email);

    if (!email) {
      console.log("ERROR: Email is required but not provided");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the project
    console.log("Looking for project with ID:", params.id);
    const project = await Project.findById(params.id);
    if (!project) {
      console.log("ERROR: Project not found with ID:", params.id);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    console.log(
      "Project found:",
      project.name,
      "Owner:",
      project.ownerId.toString(),
    );

    // Check if user is the owner
    if (project.ownerId.toString() !== decoded.userId) {
      console.log(
        "ERROR: User is not the owner. Project owner:",
        project.ownerId.toString(),
        "Current user:",
        decoded.userId,
      );
      return NextResponse.json(
        { error: "Only the owner can invite members" },
        { status: 403 },
      );
    }
    console.log("User is verified as project owner");

    // Find the user to invite (optional - user can be invited even if not registered yet)
    console.log("Searching for user with email:", email);
    const userToInvite = await User.findOne({ email });

    if (userToInvite) {
      console.log(
        "User found:",
        userToInvite.name,
        "ID:",
        userToInvite._id.toString(),
      );

      // Check if user is already a member
      if (project.members.includes(userToInvite._id)) {
        return NextResponse.json(
          { error: "User is already a member" },
          { status: 400 },
        );
      }
    } else {
      console.log("User not found with email:", email);
      console.log("This is OK - user will be invited and can register later");
    }

    // Check if there's already a pending invitation
    const existingInvitation = await Invitation.findOne({
      projectId: project._id,
      inviteeEmail: email,
      status: "pending",
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent" },
        { status: 400 },
      );
    }

    // Generate invitation token
    const invitationToken = require("node:crypto")
      .randomBytes(32)
      .toString("hex");

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Generate invitation link
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitationToken}`;

    // Send email
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
      // Continue even if email fails, as we'll return the link for development
    }

    return NextResponse.json({
      success: true,
      invitationLink,
      message: "Invitation sent successfully",
      // For development, return the link. In production, this should be sent via email
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 },
    );
  }
}
