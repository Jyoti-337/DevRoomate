import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import User from '@/models/User';

export async function GET() {

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userId = session.user.id;

    // Find chats where user is a participant
    const chats = await Chat.find({
      participants: userId,
    })
      .populate({
        path: 'participants',
        select: 'name email image avatar username role availability bio techStack stack',
        model: User,
      })
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate unread count for each chat for the current user
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat: any) => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          senderId: { $ne: userId },
          seen: false,
        });

        return {
          id: chat._id.toString(),
          participants: chat.participants.map((p: any) => ({
            id: p._id ? p._id.toString() : p.id,
            name: p.name,
            email: p.email,
            image: p.image || p.avatar,
            avatar: p.avatar || p.image,
            username: p.username,
            role: p.role,
            availability: p.availability,
          })),
          lastMessage: chat.lastMessage || '',
          updatedAt: chat.updatedAt,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ chats: chatsWithUnread });
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId } = await req.json();
    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    const userId = session.user.id;
    if (userId === recipientId) {
      return NextResponse.json({ error: 'Cannot create a chat thread with yourself' }, { status: 400 });
    }

    await dbConnect();

    // Check if recipient exists
    const recipientExists = await User.findById(recipientId);
    if (!recipientExists) {
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 });
    }

    // Find existing chat thread between these two users
    let chat = await Chat.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [userId, recipientId],
        lastMessage: '',
      });
    }

    await chat.populate({
      path: 'participants',
      select: 'name email image avatar username role availability',
      model: User,
    });

    const formattedChat = {
      id: chat._id.toString(),
      participants: chat.participants.map((p: any) => ({
        id: p._id ? p._id.toString() : p.id,
        name: p.name,
        email: p.email,
        image: p.image || p.avatar,
        avatar: p.avatar || p.image,
        username: p.username,
        role: p.role,
        availability: p.availability,
      })),
      lastMessage: chat.lastMessage || '',
      updatedAt: chat.updatedAt,
      unreadCount: 0,
    };

    return NextResponse.json({ chat: formattedChat });
  } catch (error: any) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: error.message || 'Failed to create chat' }, { status: 500 });
  }
}
