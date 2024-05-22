import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

interface InvitePageProps {
  params: {
    inviteCode: string;
  };
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const profile = await currentProfile();
  if (!profile) {
    return redirectToSignIn();
  }

  if (!params.inviteCode) {
    return redirect('/');
  }

  const exisitingServer = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (exisitingServer) {
    return redirect(`/servers/${exisitingServer.id}`);
  }

  const joinServer = await db.server.update({
    where: {
      inviteCode: params.inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          },
        ],
      },
    },
  });

  if (joinServer) {
    return redirect(`/servers/${joinServer.id}`);
  }
  return null;
};

export default InvitePage;
