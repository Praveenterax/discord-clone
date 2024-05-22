import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const DELETE = async (
  req: Request,
  { params }: { params: { memberId: string } }
) => {
  try {
    const { memberId } = params;
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('serverId');
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json(
        { message: 'Unauthorized action' },
        { status: 401 }
      );
    }
    if (!memberId) {
      return NextResponse.json(
        { message: 'Member id is missing' },
        { status: 404 }
      );
    }
    if (!serverId) {
      return NextResponse.json(
        { message: 'Server id is missing' },
        { status: 404 }
      );
    }
    const server = await db?.server?.update({
      where: {
        id: serverId,
        profileId: profile?.id,
      },
      data: {
        members: {
          deleteMany: {
            id: memberId,
            profileId: {
              not: profile?.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: 'asc',
          },
        },
      },
    });
    return NextResponse.json(server, { status: 200 });
  } catch (err) {
    console.log('MEMBER_ID_DELETE', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
};

export const PATCH = async (
  req: Request,
  { params }: { params: { memberId: string } }
) => {
  try {
    const { memberId } = params;
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('serverId');
    const { role } = await req.json();
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json(
        { message: 'Unauthorized action' },
        { status: 401 }
      );
    }
    if (!memberId) {
      return NextResponse.json(
        { message: 'Member id is missing' },
        { status: 404 }
      );
    }
    if (!serverId) {
      return NextResponse.json(
        { message: 'Server id is missing' },
        { status: 404 }
      );
    }
    const server = await db?.server?.update({
      where: {
        id: serverId,
        profileId: profile?.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
              profileId: {
                not: profile?.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: 'asc',
          },
        },
      },
    });
    return NextResponse.json(server, { status: 200 });
  } catch (err) {
    console.log('[MEMBERID]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
};
