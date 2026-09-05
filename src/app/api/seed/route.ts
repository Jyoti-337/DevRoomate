import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { developers } from '@/data/developers';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';
    const secret = searchParams.get('secret');

    // Production Lockdown: Require process.env.SEED_SECRET to be configured and matched.
    // If SEED_SECRET is unset in production, seeding is blocked unconditionally.
    if (process.env.NODE_ENV === 'production') {
      const configuredSecret = process.env.SEED_SECRET;
      if (!configuredSecret || secret !== configuredSecret) {
        return NextResponse.json(
          { error: 'Forbidden: Seeding API is locked down in production' },
          { status: 403 }
        );
      }
    }


    const existingUserCount = await User.countDocuments();
    
    // Safeguard: Only seed if database is empty or explicitly forced
    if (existingUserCount > 0 && !force) {
      return NextResponse.json({
        message: `Database already contains ${existingUserCount} user(s). Seeding skipped to preserve existing data. Pass ?force=true to force re-seeding.`,
        userCount: existingUserCount,
        skipped: true
      });
    }


    const hashedPassword = await bcrypt.hash("password123", 10);

    // Map the local mock `developers` array into the Mongo User schema format
    const usersToInsert = developers.map((dev, i) => {
      const projectTypes = ["Startup MVP"];
      if (dev.availability === "Hackathons") projectTypes.push("Hackathon");
      if (dev.lookingFor.includes("Open Source")) projectTypes.push("Open Source");
      if (dev.lookingFor.includes("SaaS")) projectTypes.push("SaaS");
      
      const level = i % 3 === 0 ? "beginner" : "intermediate";
      const isRemoteOnly = i % 2 === 0;

      return {
        name: dev.name,
        username: dev.name.toLowerCase().replace(/ /g, '') + i,
        email: `${dev.name.toLowerCase().replace(/ /g, '')}@example.com`,
        password: hashedPassword,
        avatar: dev.avatar,
        bio: `Looking for: ${dev.lookingFor}`,
        techStack: dev.stack,
        availability: dev.availability,
        timezone: dev.timezone,
        projectType: projectTypes,
        isRemoteOnly: isRemoteOnly,
        level: level,
        role: "user"
      };
    });

    if (force) {
      // Clear existing seeded mock users if explicitly forced
      await User.deleteMany({ email: { $in: usersToInsert.map(u => u.email) } });
    }

    await User.insertMany(usersToInsert);

    return NextResponse.json({ 
      message: "Seeded successfully into MongoDB", 
      inserted: usersToInsert.length,
      defaultUserCredentials: {
        email: usersToInsert[0].email,
        password: "password123"
      }
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

