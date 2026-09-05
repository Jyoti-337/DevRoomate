import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import CollabRequest from "@/models/CollabRequest";
import User from "@/models/User";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, title, description, projectType, roles, stackNeeded, timeline, remoteOnly } = await req.json();

    await connectToDatabase();
    
    const request = await CollabRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "Collaboration request not found" }, { status: 404 });
    }

    // Verify ownership
    if (request.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized: You are not the owner of this request" }, { status: 403 });
    }

    // Apply updates
    if (status !== undefined) {
      if (!['active', 'closed'].includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      request.status = status;
    }
    
    if (title !== undefined) request.title = title;
    if (description !== undefined) request.description = description;
    if (projectType !== undefined) request.projectType = projectType;
    if (roles !== undefined) request.roles = roles;
    if (stackNeeded !== undefined) request.stackNeeded = stackNeeded;
    if (timeline !== undefined) request.timeline = timeline;
    if (remoteOnly !== undefined) request.remoteOnly = remoteOnly;

    await request.save();

    return NextResponse.json(request);
  } catch (error) {
    console.error("PATCH /api/requests/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const request = await CollabRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "Collaboration request not found" }, { status: 404 });
    }

    // Verify ownership
    if (request.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized: You are not the owner of this request" }, { status: 403 });
    }

    await CollabRequest.deleteOne({ _id: id });

    return NextResponse.json({ success: true, message: "Collaboration request deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/requests/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
