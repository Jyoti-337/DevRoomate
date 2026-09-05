import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import fs from "fs";
import path from "path";

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

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create unique filename
    const ext = file.type.split("/")[1] || "jpg";
    const filename = `${user._id.toString()}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    // Cleanup old custom upload if it exists
    if (user.avatar && user.avatar.startsWith("/uploads/")) {
      const oldFilePath = path.join(process.cwd(), "public", user.avatar);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.error("Failed to delete older avatar file:", e);
        }
      }
    }

    const imagePath = `/uploads/${filename}`;
    user.avatar = imagePath;
    await user.save();

    return NextResponse.json({ success: true, avatar: imagePath });
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

    // Delete custom uploaded file from disk if it exists
    if (user.avatar && user.avatar.startsWith("/uploads/")) {
      const oldFilePath = path.join(process.cwd(), "public", user.avatar);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.error("Failed to delete user avatar file:", e);
        }
      }
    }

    user.avatar = undefined;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Remove avatar route error:", error);
    return NextResponse.json({ error: "Failed to remove photo", details: error.message }, { status: 500 });
  }
}
