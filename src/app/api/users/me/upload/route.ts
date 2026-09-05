import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    // Validate format (jpeg, png, webp)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported format. Use JPG, PNG, or WEBP." }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert compressed image to Base64 Data URL for MongoDB storage only
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    user.avatar = dataUrl;
    await user.save();

    // CRITICAL: Always return a short proxy URL string (/api/users/[id]/avatar), NEVER the raw Base64 data string!
    // Prevents client session / JWT cookie from inflating to >4KB and triggering HTTP 494 REQUEST_HEADER_TOO_LARGE.
    const avatarProxyUrl = `/api/users/${user._id.toString()}/avatar`;

    return NextResponse.json({ success: true, avatar: avatarProxyUrl });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: "Failed to upload image", details: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.avatar = undefined;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Remove avatar route error:", error);
    return NextResponse.json({ error: "Failed to remove photo", details: error.message }, { status: 500 });
  }
}
