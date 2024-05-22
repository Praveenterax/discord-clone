import { NextResponse } from 'next/server';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

export const PATCH = async (
  req: Request,
  { params }: { params: { serverId: string } }
) => {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json(
        { message: 'Unauthorized action' },
        { status: 401 }
      );
    }
    const { name, imageUrl } = await req.json();

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(server);
  } catch (err) {
    console.log('[SERVER_ID PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { serverId: string } }
) => {
  try {
    const { serverId } = params;
    if (!serverId) {
      return NextResponse.json(
        { message: 'Server Id is missing' },
        { status: 400 }
      );
    }
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json(
        { message: 'Unauthorized action' },
        { status: 401 }
      );
    }
    const server = await db.server.deleteMany({
      where: {
        id: serverId,
        profileId: profile?.id,
      },
    });
    return NextResponse.json(server);
  } catch (err) {
    console.log('SERVER_ID_DELETE', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
