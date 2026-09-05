import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Ensure this path matches the project
import connectToDatabase from '@/lib/db';
import Ping from '@/models/Ping';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ pendingReceived: 0 }, { status: 401 });
    }

    await connectToDatabase();

    const count = await Ping.countDocuments({
      receiverId: session.user.id,
      status: 'pending'
    });

    return NextResponse.json({ pendingReceived: count });
  } catch (error) {
    console.error('Error fetching ping count:', error);
    return NextResponse.json({ pendingReceived: 0 }, { status: 500 });
  }
}
