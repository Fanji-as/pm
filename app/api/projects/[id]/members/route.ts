import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import Project from "@/models/Project";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

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

    // Find the project
    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is the owner
    if (project.ownerId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Only the owner can invite members" },
        { status: 403 },
      );
    }

    // Find the user to invite
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a member
    if (project.members.includes(userToInvite._id)) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 400 },
      );
    }

    // Add user to project members
    project.members.push(userToInvite._id);
    await project.save();

    // Return the added member with their details
    const member = await User.findById(userToInvite._id).select("-password");

    if (!member) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      member: {
        _id: member._id,
        name: member.name,
        email: member.email,
      },
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Failed to invite user" },
      { status: 500 },
    );
  }
}

export async function GET(
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

    // Find the project
    const project = await Project.findById(params.id).populate(
      "members",
      "-password",
    );
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is the owner or a member
    if (
      project.ownerId.toString() !== decoded.userId &&
      !project.members.some((m: any) => m._id.toString() === decoded.userId)
    ) {
      return NextResponse.json(
        { error: "You don't have access to this project" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      members: project.members,
    });
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json(
      { error: "Failed to fetch project members" },
      { status: 500 },
    );
  }
}
