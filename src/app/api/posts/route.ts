import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const techStack = searchParams.get("techStack");
    
    await connectToDatabase();
    
    const query: any = { status: "open" };
    if (techStack) {
      query.techStack = { $in: techStack.split(",") };
    }
    
    const posts = await Post.find(query)
      .populate("authorId", "name username avatar role")
      .sort({ createdAt: -1 });
      
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET_POSTS_ERROR", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, projectType, techStack, teamSize, availability } = await req.json();

    if (!title || !description || !projectType || !techStack || !availability) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const authorId = (session.user as any).id;
    if (!authorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await Post.create({
      authorId,
      title,
      description,
      projectType,
      techStack,
      teamSize,
      availability,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("CREATE_POST_ERROR", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
