import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Check if any user other than the current user has this username
    const existingUser = await User.findOne({ username });
    const currentUser = await User.findOne({ email: session.user.email });
    
    // It is available if no one has it, or if the current user has it
    const isAvailable = !existingUser || (currentUser && existingUser._id.toString() === currentUser._id.toString());

    return NextResponse.json({ available: isAvailable });
  } catch (error) {
    console.error("GET /api/users/check-username error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
