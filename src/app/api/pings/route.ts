import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Ping from "@/models/Ping";
import User from "@/models/User";

const mapUser = (user: any) => {
  if (!user) return null;
  return {
    id: user._id?.toString(),
    email: user.email,
    name: user.name,
    username: user.username,
    image: user.avatar,
    bio: user.bio,
    role: user.role,
    stack: user.techStack || [],
    availability: user.availability,
    githubUrl: user.github,
    projectType: user.projectType || [],
  };
};

const mapPing = (ping: any) => ({
  id: ping._id.toString(),
  message: ping.message,
  status: ping.status,
  createdAt: ping.createdAt,
  sender: mapUser(ping.senderId),
  receiver: mapUser(ping.receiverId),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sent = await Ping.find({ senderId: currentUser._id })
      .populate('receiverId', '-password')
      .populate('senderId', '-password')
      .sort({ createdAt: -1 });

    const received = await Ping.find({ receiverId: currentUser._id })
      .populate('senderId', '-password')
      .populate('receiverId', '-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      sent: sent.map(mapPing),
      received: received.map(mapPing),
    });
  } catch (error) {
    console.error("GET /api/pings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, message } = await req.json();

    if (!receiverId) {
      return NextResponse.json({ error: "Receiver ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const sender = await User.findOne({ email: session.user.email });
    
    if (!sender) return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    
    if (sender._id.toString() === receiverId) {
      return NextResponse.json({ error: "Cannot ping yourself" }, { status: 400 });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    // Check for duplicate pending ping
    const existingPing = await Ping.findOne({
      senderId: sender._id,
      receiverId,
      status: 'pending'
    });

    if (existingPing) {
      return NextResponse.json({ error: "Ping already sent" }, { status: 400 });
    }

    const ping = await Ping.create({
      senderId: sender._id,
      receiverId,
      message,
      status: 'pending'
    });

    return NextResponse.json(ping, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/pings error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: "Validation failed: " + Object.values(error.errors).map((e: any) => e.message).join(", ") }, { status: 400 });
    }
    if (error.name === "CastError") {
      return NextResponse.json({ error: `Invalid ID format for receiver` }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
