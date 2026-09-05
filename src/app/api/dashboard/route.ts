import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Ping from "@/models/Ping";

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
    
    const user = await User.findOne({ email: session.user.email }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Pings
    const pingsSent = await Ping.countDocuments({ senderId: user._id });
    const pingsReceived = await Ping.countDocuments({ receiverId: user._id });
    
    const recentPingsReceived = await Ping.find({ receiverId: user._id })
      .populate('senderId', '-password')
      .populate('receiverId', '-password')
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentPingsSent = await Ping.find({ senderId: user._id })
      .populate('receiverId', '-password')
      .populate('senderId', '-password')
      .sort({ createdAt: -1 })
      .limit(3);

    // Top matches (simplified: anyone who has overlapping tech stack)
    const userStack = user.techStack || [];
    const allUsers = await User.find({ _id: { $ne: user._id } }).select("-password");
    
    const usersWithScores = allUsers.map((u) => {
      const uStack = u.techStack || [];
      const shared = uStack.filter((tech: string) => userStack.includes(tech));
      const matchScore = userStack.length > 0 
        ? Math.round((shared.length / Math.max(userStack.length, 1)) * 100) 
        : 0;
      return { ...mapUser(u), matchScore };
    });

    const topMatches = usersWithScores
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
      
    const avgMatchScore = topMatches.length > 0
      ? Math.round(topMatches.reduce((acc, u) => acc + u.matchScore, 0) / topMatches.length)
      : 0;

    return NextResponse.json({
      user: mapUser(user),
      stats: {
        pingsSent,
        pingsReceived,
        profileViews: 0,
        avgMatchScore
      },
      topMatches,
      recentPingsReceived: recentPingsReceived.map(mapPing),
      recentPingsSent: recentPingsSent.map(mapPing)
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
