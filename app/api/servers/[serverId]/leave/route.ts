import { NextResponse } from 'next/server';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

export const PATCH = async (
  req: Request,
  { params }: { params: { serverId: string } }
) => {
  try {
    const { serverId } = params;
    if (!serverId) {
      return NextResponse.json(
        { message: 'Server Id is missing' },
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
    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: {
          not: profile?.id,
        },
        members: {
          some: {
            profileId: profile?.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile?.id,
          },
        },
      },
    });
    return NextResponse.json({ server }, { status: 200 });
  } catch (err) {
    console.log('SERVER_LEAVE', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
