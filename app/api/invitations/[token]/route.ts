import { NextRequest, NextResponse } from "next/server";
import Invitation from "@/models/Invitation";
import Project from "@/models/Project";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    await connectDB();

    console.log("=== GET INVITATION DEBUG ===");
    console.log("Token:", params.token);

    // Find the invitation
    const invitation = await Invitation.findOne({ token: params.token });

    if (!invitation) {
      console.log("ERROR: Invitation not found with token:", params.token);
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 },
      );
    }

    console.log("Invitation found:", invitation._id.toString());
    console.log("Invitation status:", invitation.status);
    console.log("Invitation expires at:", invitation.expiresAt);

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      console.log("ERROR: Invitation has expired");
      await Invitation.findByIdAndUpdate(invitation._id, { status: "expired" });
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    // Get project details
    const project = await Project.findById(invitation.projectId);
    if (!project) {
      console.log("ERROR: Project not found");
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.log("Project found:", project.name);

    // Get inviter details
    const inviter = await User.findById(invitation.inviterId);
    if (!inviter) {
      console.log("ERROR: Inviter not found");
      return NextResponse.json({ error: "Inviter not found" }, { status: 404 });
    }

    console.log("Inviter found:", inviter.name);

    const invitationData = {
      projectName: project.name,
      inviterName: inviter.name,
      inviterEmail: inviter.email,
      inviteeEmail: invitation.inviteeEmail,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    };

    console.log("Returning invitation data:", invitationData);

    return NextResponse.json({
      success: true,
      invitation: invitationData,
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 },
    );
  }
}
