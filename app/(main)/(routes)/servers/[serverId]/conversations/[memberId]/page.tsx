import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { getOrCreateConversation } from '@/lib/conversation';
import ChatHeader from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { MediaRoom } from '@/components/media-room';

interface MemberIdPageProps {
  params: {
    memberId: string;
    serverId: string;
  };
  searchParams: {
    video?: boolean;
  };
}

const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
  const { serverId, memberId } = params;
  const { video } = searchParams;

  const profile = await currentProfile();
  if (!profile) {
    return redirectToSignIn();
  }

  const currentMember = await db?.member?.findFirst({
    where: {
      serverId,
      profileId: profile?.id,
    },
    include: {
      profile: true,
    },
  });
  if (!currentMember) {
    return redirect('/');
  }

  const conversations = await getOrCreateConversation(
    currentMember?.id,
    memberId
  );
  if (!conversations) {
    return redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversations;
  const otherMember =
    memberOne?.id === currentMember?.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={otherMember?.profile?.name}
        serverId={serverId}
        type="conversation"
        imageUrl={otherMember?.profile?.imageUrl}
      />
      {video && (
        <MediaRoom
          audio={true}
          video={true}
          chatId={conversations.id}
          type="conversation"
        />
      )}
      {!video && (
        <>
          <ChatMessages
            name={otherMember?.profile?.name}
            member={currentMember}
            type="conversation"
            chatId={conversations?.id}
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversations?.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{
              conversationId: conversations?.id,
            }}
          />
          <ChatInput
            name={otherMember?.profile?.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{
              conversationId: conversations?.id,
            }}
          />
        </>
      )}
    </div>
  );
};

export default MemberIdPage;
