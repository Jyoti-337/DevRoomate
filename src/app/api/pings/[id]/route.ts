import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Ping from "@/models/Ping";
import User from "@/models/User";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const ping = await Ping.findById(id);
    if (!ping) return NextResponse.json({ error: "Ping not found" }, { status: 404 });

    // Only receiver can change status to accepted/rejected/pending
    if (ping.receiverId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    ping.status = status;
    await ping.save();

    let chatId = null;
    if (status === 'accepted') {
      const Chat = (await import("@/models/Chat")).default;
      let chat = await Chat.findOne({
        participants: { $all: [ping.senderId, ping.receiverId] }
      });
      if (!chat) {
        chat = await Chat.create({
          participants: [ping.senderId, ping.receiverId],
          lastMessage: ping.message || 'Connected via Ping request',
        });
      }
      chatId = chat._id.toString();
    }

    return NextResponse.json({
      id: ping._id.toString(),
      senderId: ping.senderId,
      receiverId: ping.receiverId,
      status: ping.status,
      message: ping.message,
      createdAt: ping.createdAt,
      chatId,
    });
  } catch (error) {
    console.error("PATCH /api/pings/[id] error:", error);
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const ping = await Ping.findById(id);
    if (!ping) return NextResponse.json({ error: "Ping not found" }, { status: 404 });

    // Only sender can delete their ping
    if (ping.senderId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Ping.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/pings/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
