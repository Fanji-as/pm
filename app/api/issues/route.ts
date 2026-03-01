import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Issue from "@/models/Issue";
import { verifyToken } from "@/lib/auth";

// GET all issues for a project
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const issues = await Issue.find({ projectId })
      .populate("assigneeId", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ issues }, { status: 200 });
  } catch (error) {
    console.error("Get issues error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create a new issue
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { title, description, priority, projectId, assigneeId } =
      await request.json();

    if (!title || !description || !projectId) {
      return NextResponse.json(
        { error: "Title, description, and projectId are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const issue = await Issue.create({
      title,
      description,
      priority: priority || "medium",
      projectId,
      assigneeId: assigneeId || null,
      createdBy: decoded.userId,
      status: "todo",
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate("assigneeId", "name email")
      .populate("createdBy", "name email");

    return NextResponse.json({ issue: populatedIssue }, { status: 201 });
  } catch (error) {
    console.error("Create issue error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
