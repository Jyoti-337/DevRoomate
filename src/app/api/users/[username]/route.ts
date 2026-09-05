import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Ping from "@/models/Ping";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    const { username: rawUsername } = await params;
    const cleanUsername = decodeURIComponent(rawUsername).trim();
    const escapedUsername = cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Case-insensitive regex lookup for username, with ObjectId fallback
    let user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } },
      ],
    }).select("-password");

    if (!user && cleanUsername.length === 24 && mongoose.Types.ObjectId.isValid(cleanUsername)) {
      user = await User.findById(cleanUsername).select("-password");
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let pingStatus = null;

    if (session?.user?.email) {
      const currentUser = await User.findOne({ email: session.user.email });
      if (currentUser && currentUser._id.toString() !== user._id.toString()) {
        const ping = await Ping.findOne({
          senderId: currentUser._id,
          receiverId: user._id,
        }).sort({ createdAt: -1 });

        if (ping) {
          pingStatus = ping.status;
        }
      }
    }

    const mappedUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      username: user.username,
      image: user.avatar,
      bio: user.bio,
      role: user.role,
      stack: user.techStack || [],
      availability: user.availability,
      timezone: user.timezone,
      lookingFor: user.lookingFor || null,
      githubUrl: user.github,
      twitterUrl: user.twitterUrl || null,
      linkedinUrl: user.linkedin,
      portfolioUrl: user.portfolio,
      projectType: user.projectType || [],
      level: user.level,
      isRemoteOnly: user.isRemoteOnly,
      createdAt: user.createdAt,
      pingStatus,
    };

    return NextResponse.json(mappedUser);
  } catch (error) {
    console.error("GET /api/users/[username] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
