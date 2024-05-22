import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { MemberRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const { name, type } = await req.json();
    const serverId = searchParams.get('serverId');
    if (!serverId) {
      return NextResponse.json(
        { message: 'Server id is missing' },
        { status: 404 }
      );
    }
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json(
        { message: 'Unauthorized action' },
        { status: 401 }
      );
    }
    if (name === 'general') {
      return NextResponse.json(
        { message: 'Channel name cannot be general' },
        { status: 400 }
      );
    }
    const currentServer = await db.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile?.id,
          },
        },
      },
      include: {
        members: true,
        channels: true,
      },
    });
    const isGuest =
      currentServer?.members.find((mem) => mem?.profileId === profile?.id)
        ?.role === 'GUEST';
    if (isGuest) {
      return NextResponse.json({ message: 'Unauthorized action', status: 403 });
    }
    const channelExists = currentServer?.channels?.find(
      (channel) => channel.name === name
    );
    if (channelExists) {
      return NextResponse.json(
        { message: 'Channel with same name already exists on this server' },
        { status: 403 }
      );
    }
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile?.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
        AND: {
          channels: {
            none: {
              name,
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            name,
            type,
            profileId: profile?.id,
          },
        },
      },
    });
    return NextResponse.json(server, { status: 200 });
  } catch (err) {
    console.log('CHANNEL CREATION ERROR | SERVERID', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
