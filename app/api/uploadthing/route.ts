import { createNextRouteHandler } from 'uploadthing/next';
import { NextResponse } from 'next/server';

import { currentProfile } from '@/lib/current-profile';
import { ourFileRouter, utApi } from './core';

// Export routes for Next App Router
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});

export const DELETE = async (req: Request) => {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    if (!profile) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const fileId = searchParams.get('fileId');
    if (!fileId) {
      return NextResponse.json(
        { message: 'File key missing' },
        { status: 403 }
      );
    }
    const response = await utApi.deleteFiles(fileId);
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
