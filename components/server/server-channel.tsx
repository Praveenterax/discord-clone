'use client';
import { Channel, ChannelType, MemberRole, Server } from '@prisma/client';
import { Edit, Hash, Lock, Mic, Trash, Video } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { ActionTooltip } from '@/components/action-tooltip';
import { ModalType, useModalStore } from '@/hooks/use-modal-store';
interface ServerChannelProps {
  channel: Channel;
  role?: MemberRole;
  server: Server;
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
};

export const ServerChannel = ({
  channel,
  role,
  server,
}: ServerChannelProps) => {
  const { onOpen } = useModalStore();

  const params = useParams();
  const router = useRouter();
  const { channelId } = params;
  const Icon = iconMap[channel.type];

  const onChannelClick = () => {
    router.push(`/servers/${params?.serverId}/channels/${channel.id}`);
  };

  const onActionClick = (e: React.MouseEvent, action: ModalType) => {
    e?.stopPropagation();
    onOpen(action, { server, channel });
  };

  return (
    <div>
      <button
        onClick={onChannelClick}
        className={cn(
          'group px-2 py-2 flex items-center gap-x-2 rounded-md w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
          channel?.id === channelId && 'bg-zinc-700/20 dark:bg-zinc-700'
        )}
      >
        <Icon className="flex-shrink-0 h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        <p
          className={cn(
            'line-clamp-1 font-semibold text-sm text-zinc-500 dark:text-zinc-400/80 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition w-full text-left',
            channel?.id === channelId &&
              'text-primary dark:text-zinc-200 dark:group-hover:text-white'
          )}
        >
          {channel.name}
        </p>
        {channel?.name !== 'general' && role !== MemberRole.GUEST && (
          <div className="ml-auto flex items-center gap-x-2">
            <ActionTooltip label="Edit">
              <Edit
                onClick={(e) => onActionClick(e, 'editChannel')}
                className="hidden group-hover:block w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
            <ActionTooltip label="Delete">
              <Trash
                onClick={(e) => onActionClick(e, 'deleteChannel')}
                className="hidden group-hover:block w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          </div>
        )}
        {channel.name === 'general' && (
          <Lock className="ml-auto h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        )}
      </button>
    </div>
  );
};
