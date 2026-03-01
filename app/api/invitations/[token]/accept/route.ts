import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Project from "@/models/Project";
import Invitation from "@/models/Invitation";
import connectDB from "@/lib/mongodb";
import { Types } from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } },
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

    // Find the invitation
    const invitation = await Invitation.findOne({
      token: params.token,
      status: "pending",
    }).populate("projectId inviterId");

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found or expired" },
        { status: 404 },
      );
    }

    // Check if invitation is expired
    if (new Date() > invitation.expiresAt) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: "expired" });
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    // Check if the user's email matches the invitee email
    // For now, we'll allow any logged-in user to accept the invitation
    // In a real application, you might want to verify the email

    // Add user to project members
    const project = await Project.findById(invitation.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is already a member
    const userId = new Types.ObjectId(decoded.userId);
    if (project.members.includes(userId)) {
      await Invitation.findByIdAndUpdate(invitation._id, {
        status: "accepted",
      });
      return NextResponse.json({
        success: true,
        message: "You are already a member of this project",
      });
    }

    // Add user to project
    project.members.push(userId);
    await project.save();

    // Update invitation status
    await Invitation.findByIdAndUpdate(invitation._id, { status: "accepted" });

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      projectId: project._id,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    await connectDB();

    // Find the invitation
    const invitation = await Invitation.findOne({
      token: params.token,
      status: "pending",
    })
      .populate("projectId")
      .populate("inviterId", "name email");

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found or expired" },
        { status: 404 },
      );
    }

    // Check if invitation is expired
    if (new Date() > invitation.expiresAt) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: "expired" });
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        projectName: (invitation.projectId as any).name,
        inviterName: (invitation.inviterId as any).name,
        inviterEmail: (invitation.inviterId as any).email,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 },
    );
  }
}
