import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Project from "@/models/Project";
import connectDB from "@/lib/mongodb";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } },
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

    // Find the project
    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is the owner
    if (project.ownerId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Only the owner can remove members" },
        { status: 403 },
      );
    }

    // Check if member exists
    const memberIndex = project.members.indexOf(params.memberId as any);
    if (memberIndex === -1) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Remove member from project
    project.members.splice(memberIndex, 1);
    await project.save();

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing user:", error);
    return NextResponse.json(
      { error: "Failed to remove user" },
      { status: 500 },
    );
  }
}
