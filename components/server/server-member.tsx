'use client';

import { Member, MemberRole, Profile } from '@prisma/client';
import { ShieldCheck, ShieldPlus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import UserAvatar from '@/components/user-avatar';
import { cn } from '@/lib/utils';

interface ServerMemberProps {
  member: Member & { profile: Profile };
}

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="ml-2 h-4 w-4 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldPlus className="ml-2 h-4 w-4 text-rose-500" />,
};

export const ServerMember = ({ member }: ServerMemberProps) => {
  const params = useParams();
  const router = useRouter();

  const onMemberClick = () => {
    router.push(`/servers/${params?.serverId}/conversations/${member?.id}`);
  };

  const icon = roleIconMap[member?.role];

  return (
    <button
      className={cn(
        'group p-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
        params?.memberId === member?.id && 'bg-zinc-700/10 dark:bg-zinc-700/20'
      )}
      onClick={onMemberClick}
    >
      <UserAvatar
        src={member?.profile?.imageUrl}
        className="w-8 h-8 md:h-8 md:w-8"
      />
      <p
        className={cn(
          'font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300',
          params?.memberId === member?.id &&
            'text-primary dark:text-zinc-200 dark:group-hover:text-white'
        )}
      >
        {member?.profile?.name}
      </p>
      {icon}
    </button>
  );
};
