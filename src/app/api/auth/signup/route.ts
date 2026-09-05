import { NextResponse as NextServerResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password, techStack, availability, bio } = body;

    if (!name || name.trim().length < 2) {
      return NextServerResponse.json({ message: "Full Name must be at least 2 characters long." }, { status: 400 });
    }

    if (!username || username.trim().length < 3) {
      return NextServerResponse.json({ message: "Username must be at least 3 characters long." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextServerResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextServerResponse.json({ message: "Password must be at least 8 characters long." }, { status: 400 });
    }

    await connectToDatabase();

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextServerResponse.json({ message: "An account with this email address already exists." }, { status: 400 });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextServerResponse.json({ message: "This username is already taken. Please choose another." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      techStack: (techStack && techStack.length > 0) ? techStack : ["React"],
      availability: availability || "Part-time",
      timezone: "UTC-8",
      projectType: ["Startup MVP"],
      role: "Developer",
      bio: bio || "",
    });

    return NextServerResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("REGISTRATION_ERROR", error);
    if (
      error?.name === 'MongooseServerSelectionError' || 
      error?.code === 'ECONNREFUSED' || 
      error?.message?.includes('ECONNREFUSED') ||
      error?.message?.includes('buffering timed out')
    ) {
      return NextServerResponse.json(
        { message: "Service temporarily unavailable. Database connection could not be established." },
        { status: 503 }
      );
    }
    return NextServerResponse.json({ message: error?.message || "Registration failed. Please try again." }, { status: 500 });
  }
}
