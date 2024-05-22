import { NextResponse } from 'next/server';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { MemberRole } from '@prisma/client';

export const DELETE = async (
  req: Request,
  { params }: { params: { channelId: string } }
) => {
  try {
    const { channelId } = params;
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('serverId');

    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!serverId) {
      return NextResponse.json(
        { message: 'Server Id is missing' },
        { status: 403 }
      );
    }
    if (!channelId) {
      return NextResponse.json(
        { message: 'Channel Id is missing' },
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
              not: MemberRole.GUEST,
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: channelId,
            name: {
              not: 'general',
            },
          },
        },
      },
    });
    return NextResponse.json(server, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  req: Request,
  { params }: { params: { channelId: string } }
) => {
  try {
    const { channelId } = params;
    const { searchParams } = new URL(req.url);
    const { name, type } = await req.json();
    const serverId = searchParams.get('serverId');

    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!serverId) {
      return NextResponse.json(
        { message: 'Server Id is missing' },
        { status: 403 }
      );
    }
    if (!channelId) {
      return NextResponse.json(
        { message: 'Channel Id is missing' },
        { status: 403 }
      );
    }

    if (name === 'general') {
      return NextResponse.json(
        { message: 'Name cannot be general' },
        { status: 400 }
      );
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile?.id,
            role: {
              not: MemberRole.GUEST,
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: channelId,
              NOT: {
                name: 'general',
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });
    return NextResponse.json(server, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
