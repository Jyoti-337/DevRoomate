import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import CollabRequest from "@/models/CollabRequest";
import User from "@/models/User";
import Ping from "@/models/Ping";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error("[POST /api/requests/[id]/interest] Unauthorized attempt");
      return NextResponse.json({ error: "Unauthorized: Please log in first" }, { status: 401 });
    }

    await connectToDatabase();

    const request = await CollabRequest.findById(id);
    if (!request) {
      console.error(`[POST /api/requests/[id]/interest] Request ${id} not found`);
      return NextResponse.json({ error: "Collaboration request not found" }, { status: 404 });
    }

    const requestingUserId = session.user.id;
    const ownerUserId = request.userId.toString();

    if (ownerUserId === requestingUserId) {
      return NextResponse.json(
        { error: "You cannot express interest in your own request" },
        { status: 400 }
      );
    }

    // Add user to applicants array if not already present
    const hasApplied = request.applicants?.some(
      (applicantId: any) => applicantId.toString() === requestingUserId
    );

    if (!hasApplied) {
      if (!request.applicants) {
        request.applicants = [];
      }
      request.applicants.push(requestingUserId);
      await request.save();
    }

    // Optionally create a Ping so owner gets notified in their pings/dashboard
    const existingPing = await Ping.findOne({
      senderId: requestingUserId,
      receiverId: ownerUserId,
      postId: request._id
    });

    if (!existingPing) {
      await Ping.create({
        senderId: requestingUserId,
        receiverId: ownerUserId,
        postId: request._id,
        message: `I'm interested in your request: "${request.title}"`,
        status: "pending"
      });
    }

    return NextResponse.json({
      success: true,
      message: "Interest sent successfully!",
      applicantCount: request.applicants.length
    });
  } catch (error: any) {
    console.error("[POST /api/requests/[id]/interest] Internal Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
