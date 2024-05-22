'use client';

import { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';

interface MediaRoomProps {
  chatId: string;
  audio: boolean;
  video: boolean;
  type: 'channel' | 'conversation';
}

export const MediaRoom = ({ audio, chatId, video, type }: MediaRoomProps) => {
  const { user } = useUser();
  const [token, setToken] = useState('');
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!user?.firstName || !user?.lastName) return;

    const name = `${user.firstName} ${user.lastName}`;

    (async function () {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${name}`
        );
        const data = await resp.json();
        setToken(data?.token);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [user?.firstName, user?.lastName, chatId]);

  if (token === '') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading...
        </span>
      </div>
    );
  }

  const handleDisconnect = () => {
    if (type === 'channel') {
      router.push(`/servers/${params?.serverId}`);
    } else {
      router.push(pathname || '');
    }
  };

  return (
    <LiveKitRoom
      serverUrl={process?.env?.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      video={video}
      audio={audio}
      onDisconnected={handleDisconnect}
      data-lk-theme="default"
    >
      <VideoConference />
    </LiveKitRoom>
  );
};
