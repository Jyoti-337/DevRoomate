import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Ping from "@/models/Ping";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Map Mongoose fields to requested shape
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
    };

    return NextResponse.json(mappedUser);
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().max(60).optional(),
  username: z.string().max(30).optional(),
  role: z.string().nullable().optional(),
  bio: z.string().max(200).nullable().optional(),
  stack: z.array(z.string()).nullable().optional(),
  level: z.string().nullable().optional(),
  projectType: z.array(z.string()).nullable().optional(),
  lookingFor: z.string().max(200).nullable().optional(),
  availability: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  isRemoteOnly: z.boolean().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  twitterUrl: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  portfolioUrl: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      const errMsgs = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      return NextResponse.json({ error: `Invalid data: ${errMsgs}` }, { status: 400 });
    }

    const data = parsed.data;

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update fields
    if (data.name !== undefined) user.name = data.name ?? undefined;
    if (data.username !== undefined) user.username = data.username ?? undefined;
    if (data.role !== undefined) user.role = data.role ?? undefined;
    if (data.bio !== undefined) user.bio = data.bio ?? undefined;
    if (data.stack !== undefined) user.techStack = data.stack ?? [];
    if (data.level !== undefined) user.level = data.level ? data.level.toLowerCase() : undefined;
    if (data.projectType !== undefined) user.projectType = data.projectType ?? [];
    if (data.lookingFor !== undefined) user.lookingFor = data.lookingFor ?? undefined;
    if (data.availability !== undefined) user.availability = data.availability ?? "Part-time";
    if (data.timezone !== undefined) user.timezone = data.timezone ?? undefined;
    if (data.isRemoteOnly !== undefined) user.isRemoteOnly = data.isRemoteOnly ?? false;
    if (data.githubUrl !== undefined) user.github = data.githubUrl ?? undefined;
    if (data.twitterUrl !== undefined) user.twitterUrl = data.twitterUrl ?? undefined;
    if (data.linkedinUrl !== undefined) user.linkedin = data.linkedinUrl ?? undefined;
    if (data.portfolioUrl !== undefined) user.portfolio = data.portfolioUrl ?? undefined;
    if (data.image !== undefined) user.avatar = data.image ?? undefined;

    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("PATCH /api/users/me error:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: "Validation failed: " + Object.values(error.errors).map((e: any) => e.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({
      $or: [
        { _id: session.user.id },
        { email: session.user.email }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id;

    // Clean up related data gracefully
    await Promise.all([
      User.findByIdAndDelete(userId),
      Ping.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
      Chat.deleteMany({ participants: userId }),
      Message.deleteMany({ senderId: userId })
    ]);

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/users/me error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete account" }, { status: 500 });
  }
}
