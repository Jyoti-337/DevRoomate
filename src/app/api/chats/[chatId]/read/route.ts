import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import { triggerPusher } from '@/lib/pusher';

export async function PATCH(
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

    // Mark unread messages from other participant as seen
    const result = await Message.updateMany(
      {
        chatId,
        senderId: { $ne: userId },
        seen: false,
      },
      {
        $set: { seen: true },
      }
    );

    if (result.modifiedCount > 0) {
      // Trigger Pusher event so sender gets live read receipt update
      await triggerPusher(`chat-${chatId}`, 'messages-seen', { userId });
    }

    return NextResponse.json({ success: true, updatedCount: result.modifiedCount });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update message status' },
      { status: 500 }
    );
  }
}
