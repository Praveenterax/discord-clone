import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json(
        { message: 'Unauthorized action' },
        { status: 401 }
      );
    }
    if (!params?.serverId) {
      return NextResponse.json(
        { message: 'Server id is missing' },
        { status: 404 }
      );
    }
    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        inviteCode: uuidv4(),
      },
    });
    return NextResponse.json(server);
  } catch (err) {
    console.log('[SERVERID]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
