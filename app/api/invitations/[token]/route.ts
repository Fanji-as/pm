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

    const invitation = await Invitation.findOne({ token: params.token });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 },
      );
    }

    if (invitation.expiresAt < new Date()) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: "expired" });
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    const project = await Project.findById(invitation.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const inviter = await User.findById(invitation.inviterId);
    if (!inviter) {
      return NextResponse.json({ error: "Inviter not found" }, { status: 404 });
    }

    const invitationData = {
      projectName: project.name,
      inviterName: inviter.name,
      inviterEmail: inviter.email,
      inviteeEmail: invitation.inviteeEmail,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    };

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