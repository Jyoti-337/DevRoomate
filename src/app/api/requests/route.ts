import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import CollabRequest from '@/models/CollabRequest';
import User from '@/models/User';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(10).max(100),
  projectType: z.string().min(1),
  description: z.string().min(50).max(500),
  stackNeeded: z.array(z.string()).max(10).optional(),
  roles: z.array(z.string()).min(1),
  level: z.string().default('any'),
  timeline: z.string().optional(),
  remoteOnly: z.boolean().default(true),
  contactPreference: z.string().default('ping')
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = postSchema.parse(body);

    await connectToDatabase();

    const newRequest = await CollabRequest.create({
      userId: session.user.id,
      ...validatedData
    });

    // Optionally update user's requests array if needed
    // await User.findByIdAndUpdate(session.user.id, { $push: { requests: newRequest._id } });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectType = searchParams.get('projectType');
    const roles = searchParams.get('roles');
    const userId = searchParams.get('userId');
    const statusParam = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const skip = (page - 1) * limit;

    const query: any = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (statusParam) {
      query.status = statusParam;
    } else if (!userId) {
      query.status = 'active'; // Default to active for main feeds
    }
    
    if (projectType) {
      query.projectType = projectType;
    }
    
    if (roles) {
      const rolesArray = roles.split(',').map(r => r.trim());
      query.roles = { $in: rolesArray };
    }

    await connectToDatabase();

    const [requests, total] = await Promise.all([
      CollabRequest.find(query)
        .populate({
          path: 'userId',
          select: 'name username image role stack',
          model: User
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CollabRequest.countDocuments(query)
    ]);

    // Format the response to map `userId` to `user` to match standard frontend expectations if needed,
    // or just return as is (Mongoose populated).
    const formattedRequests = requests.map((req: any) => ({
      ...req,
      id: req._id.toString(),
      user: req.userId // renaming userId to user for frontend convenience
    }));

    return NextResponse.json({
      requests: formattedRequests,
      total,
      page,
      hasMore: total > skip + requests.length
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
