import { currentProfilePages } from '@/lib/current-profile-pages';
import { db } from '@/lib/db';
import { NextApiResponseServerIO } from '@/types';
import { NextApiRequest } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (req.method !== 'DELETE' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const profile = await currentProfilePages(req);
    const { directMessageId, conversationId } = req.query;
    const { content } = req.body;

    if (!profile) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!directMessageId) {
      return res.status(403).json({ error: 'Direct message Id is missing' });
    }
    if (!conversationId) {
      return res.status(403).json({ error: 'Conversation Id is missing' });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const member =
      conversation?.memberOne?.profileId === profile?.id
        ? conversation?.memberOne
        : conversation?.memberTwo;

    let message = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const isMessageOwner = message.memberId === member.id;

    if (!isMessageOwner) {
      return res.status(401).json({ error: 'Unauthorized action' });
    }

    if (req.method === 'DELETE') {
      message = await db.directMessage.update({
        where: {
          id: directMessageId as string,
          conversationId: conversationId as string,
        },
        data: {
          deleted: true,
          content: 'This message was deleted',
          fileUrl: '',
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }
    if (req.method === 'PATCH') {
      message = await db.directMessage.update({
        where: {
          id: directMessageId as string,
          conversationId: conversationId as string,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    const updateKey = `chat:${conversation?.id}:messages:update`;
    res?.socket?.server?.io?.emit?.(updateKey, message);

    return res.status(200).json(message);
  } catch (err) {
    console.log('MESSAGE_ID', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
