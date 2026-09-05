import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { developers } from '@/data/developers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '9', 10);
  const skip = (page - 1) * limit;

  try {
    const pipeline: any = {};

    // Multi-field search
    const search = searchParams.get('search');
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      pipeline.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { role: searchRegex },
        { bio: searchRegex },
        { techStack: searchRegex }
      ];
    }

    const availability = searchParams.get('availability');
    if (availability && availability !== 'All') {
      pipeline.availability = availability;
    }

    const timezone = searchParams.get('timezone');
    if (timezone && timezone !== 'All') {
      pipeline.timezone = timezone;
    }

    const projectType = searchParams.get('projectType');
    if (projectType && projectType !== 'All') {
      const types = projectType.split(',').map(t => t.trim()).filter(Boolean);
      if (types.length > 0) {
        pipeline.projectType = { $in: types.map(t => new RegExp(t, 'i')) };
      }
    }

    const isRemoteOnly = searchParams.get('isRemoteOnly');
    if (isRemoteOnly === 'true') {
      pipeline.isRemoteOnly = true;
    }

    const level = searchParams.get('level');
    if (level) {
      pipeline.level = level;
    }

    await dbConnect();

    // Check if DB has any users at all
    const totalDbUsersCount = await User.countDocuments({});
    if (totalDbUsersCount === 0) {
      return getFallbackUsersResponse(searchParams, skip, limit);
    }

    const users = await User.find(pipeline)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(pipeline);
    const hasMore = skip + users.length < total;

    const enhancedUsers = users.map(user => ({
      ...user,
      id: user._id.toString(),
      online: user.online !== undefined ? user.online : Math.random() > 0.5,
      matchPercentage: user.matchPercentage || Math.floor(Math.random() * (99 - 70 + 1) + 70),
      avatar: user.avatar || null,
      role: user.role && user.role !== 'user' ? user.role : 'Developer',
      projectType: user.projectType?.length ? user.projectType : ["Startup MVP"],
      techStack: user.techStack?.length ? user.techStack : ["React", "Typescript", "Node.js"],
      timezone: user.timezone || "UTC-8",
      availability: user.availability || "Part-time"
    }));

    return NextResponse.json({
      users: enhancedUsers,
      hasMore,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error: any) {
    console.warn("MongoDB connection/query issue in /api/users, serving mock fallback data:", error.message);
    return getFallbackUsersResponse(searchParams, skip, limit);
  }
}

function getFallbackUsersResponse(searchParams: URLSearchParams, skip: number, limit: number) {
  let filtered = [...developers];

  const search = searchParams.get('search')?.toLowerCase();
  if (search) {
    filtered = filtered.filter(dev =>
      dev.name.toLowerCase().includes(search) ||
      dev.role.toLowerCase().includes(search) ||
      dev.stack.some(s => s.toLowerCase().includes(search))
    );
  }

  const availability = searchParams.get('availability');
  if (availability && availability !== 'All') {
    filtered = filtered.filter(dev => dev.availability === availability);
  }

  const timezone = searchParams.get('timezone');
  if (timezone && timezone !== 'All') {
    filtered = filtered.filter(dev => dev.timezone.includes(timezone));
  }

  const enhancedMock = filtered.map(dev => ({
    ...dev,
    techStack: dev.stack,
    projectType: ["Startup MVP"],
    role: dev.role
  }));

  const paginated = enhancedMock.slice(skip, skip + limit);
  const total = enhancedMock.length;
  const hasMore = skip + paginated.length < total;

  return NextResponse.json({
    users: paginated,
    hasMore,
    total,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.ceil(total / limit),
    isFallback: true
  });
}

