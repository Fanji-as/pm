import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Issue from "@/models/Issue";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const token = request.headers
      .get("cookie")
      ?.split("token=")[1]
      ?.split(";")[0];

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const updates = await request.json();

    await connectDB();

    const issue = await Issue.findByIdAndUpdate(
      params.id,
      { ...updates, updatedAt: new Date() },
      { new: true },
    )
      .populate("assigneeId", "name email")
      .populate("createdBy", "name email");

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json({ issue }, { status: 200 });
  } catch (error) {
    console.error("Update issue error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const token = request.headers
      .get("cookie")
      ?.split("token=")[1]
      ?.split(";")[0];

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const issue = await Issue.findByIdAndDelete(params.id);

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Issue deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete issue error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
