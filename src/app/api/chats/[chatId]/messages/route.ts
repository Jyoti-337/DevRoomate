import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import User from '@/models/User';
import { triggerPusher } from '@/lib/pusher';

// In-memory rate limiting map: userId -> timestamps array
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowMs = 10000; // 10 seconds window
  const maxRequests = 5;   // max 5 messages per 10s

  const userTimestamps = (rateLimitMap.get(userId) || []).filter(
    (timestamp) => now - timestamp < windowMs
  );

  if (userTimestamps.length >= maxRequests) {
    rateLimitMap.set(userId, userTimestamps);
    return true;
  }

  userTimestamps.push(now);
  rateLimitMap.set(userId, userTimestamps);
  return false;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = await params;
    const userId = session.user.id;

    await dbConnect();

    // Verify chat existence and participant authorization
    const chat = await Chat.findById(chatId).lean();
    if (!chat) {
      return NextResponse.json({ error: 'Chat thread not found' }, { status: 404 });
    }

    const isParticipant = chat.participants.some(
      (p: any) => p.toString() === userId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const before = searchParams.get('before');
    const limitParam = parseInt(searchParams.get('limit') || '30', 10);
    const limit = Math.min(Math.max(limitParam, 1), 50);

    // Build query with cursor pagination
    const query: any = { chatId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Fetch (limit + 1) messages to check if more items exist
    const rawMessages = await Message.find(query)
      .populate({
        path: 'senderId',
        select: 'name email image avatar username',
        model: User,
      })
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = rawMessages.length > limit;
    const messagesSlice = hasMore ? rawMessages.slice(0, limit) : rawMessages;

    // Reverse to return in chronological order
    const messages = messagesSlice.reverse().map((msg: any) => {
      const extractedSenderId = msg.senderId?._id
        ? msg.senderId._id.toString()
        : typeof msg.senderId === 'object' && msg.senderId !== null
        ? msg.senderId.id
          ? String(msg.senderId.id)
          : String(msg.senderId._id || msg.senderId)
        : String(msg.senderId);

      return {
        id: msg._id.toString(),
        chatId: msg.chatId.toString(),
        senderId: extractedSenderId,
        sender: {
          id: extractedSenderId,
          name: msg.senderId?.name || 'User',
          image: msg.senderId?.image || msg.senderId?.avatar,
          username: msg.senderId?.username,
        },
        content: msg.content,
        seen: msg.seen ?? false,
        createdAt: msg.createdAt,
      };
    });

    return NextResponse.json({ messages, hasMore });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = await params;
    const userId = session.user.id;

    // Enforce anti-spam rate limiting
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a few seconds before sending more messages.' },
        { status: 429 }
      );
    }

    const { content } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Message exceeds maximum length of 2000 characters' }, { status: 400 });
    }

    await dbConnect();

    // Verify chat existence and participant authorization
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat thread not found' }, { status: 404 });
    }

    const isParticipant = chat.participants.some(
      (p: any) => p.toString() === userId
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Create message in MongoDB
    const messageDoc = await Message.create({
      chatId,
      senderId: userId,
      content: content.trim(),
      seen: false,
    });

    // Update lastMessage and timestamp on Chat
    chat.lastMessage = content.trim();
    chat.updatedAt = new Date();
    await chat.save();

    // Populate sender details for response & Pusher payload
    await messageDoc.populate({
      path: 'senderId',
      select: 'name email image avatar username',
      model: User,
    });

    const messageObj = {
      id: messageDoc._id.toString(),
      chatId: messageDoc.chatId.toString(),
      senderId: userId,
      sender: {
        id: userId,
        name: messageDoc.senderId?.name || session.user.name || 'User',
        image: messageDoc.senderId?.image || messageDoc.senderId?.avatar || session.user.image,
        username: messageDoc.senderId?.username,
      },
      content: messageDoc.content,
      seen: false,
      createdAt: messageDoc.createdAt,
    };

    // Trigger Pusher real-time event
    await triggerPusher(`chat-${chatId}`, 'new-message', messageObj);

    return NextResponse.json({ message: messageObj });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
