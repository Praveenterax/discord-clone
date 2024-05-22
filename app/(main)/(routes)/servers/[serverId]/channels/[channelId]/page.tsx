import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import ChatHeader from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChannelType } from '@prisma/client';
import { MediaRoom } from '@/components/media-room';

interface ChannelIdPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const { serverId, channelId } = params;
  const profile = await currentProfile();
  if (!profile) {
    return redirectToSignIn();
  }

  const channel = await db?.channel?.findUnique({
    where: {
      id: channelId,
    },
  });

  const member = await db?.member?.findFirst({
    where: {
      profileId: profile.id,
      serverId: serverId,
    },
  });

  if (!channel || !member) {
    return redirect('/');
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel?.name}
        serverId={channel?.serverId}
        type="channel"
      />
      {channel?.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            name={channel?.name}
            member={member}
            chatId={channel?.id}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel?.id,
              serverId: channel?.serverId,
            }}
            paramKey="channelId"
            paramValue={channel?.id}
          />
          <ChatInput
            name={channel?.name}
            apiUrl="/api/socket/messages"
            type="channel"
            query={{
              channelId: channel?.id,
              serverId: channel?.serverId,
            }}
          />
        </>
      )}
      {channel?.type === ChannelType.AUDIO && (
        <MediaRoom
          chatId={channelId}
          audio={true}
          video={false}
          type="channel"
        />
      )}
      {channel?.type === ChannelType.VIDEO && (
        <MediaRoom
          chatId={channelId}
          audio={true}
          video={true}
          type="channel"
        />
      )}
    </div>
  );
};

export default ChannelIdPage;
