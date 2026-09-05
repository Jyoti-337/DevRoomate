import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Chat from '@/models/Chat';
import Message from '@/models/Message';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ unreadCount: 0 });
    }

    await dbConnect();
    const userId = session.user.id;

    // Find all chats user participates in
    const userChats = await Chat.find({ participants: userId }).select('_id').lean();
    if (!userChats || userChats.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const chatIds = userChats.map((c) => c._id);

    // Count unread messages sent by OTHER participants in user's chats
    const unreadCount = await Message.countDocuments({
      chatId: { $in: chatIds },
      senderId: { $ne: userId },
      seen: false,
    });

    return NextResponse.json({ unreadCount });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ unreadCount: 0 });
  }
}
