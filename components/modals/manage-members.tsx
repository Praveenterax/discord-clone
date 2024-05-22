'use client';
import { useState } from 'react';
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldCheck,
  ShieldPlus,
  ShieldQuestion,
} from 'lucide-react';
import query from 'query-string';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useModalStore } from '@/hooks/use-modal-store';
import { ServerWithMembersWithProfiles } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserAvatar from '@/components/user-avatar';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { MemberRole } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.ADMIN]: <ShieldPlus className="h-4 w-4 text-rose-500" />,
  [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 text-zinc-500" />,
};

const ManageMembers = () => {
  const router = useRouter();
  const { data, type, isOpen, onClose, onOpen } = useModalStore();
  const [loadingId, setLoadingId] = useState('');

  const { server } = data as { server: ServerWithMembersWithProfiles };
  const isModalOpen = isOpen && type === 'manageMembers';

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);
      const url = query.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server?.id },
      });
      const response = await axios.delete(url);
      router.refresh();
      onOpen('manageMembers', { server: response.data });
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingId('');
    }
  };

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);
      const url = query.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server?.id },
      });
      const response = await axios.patch(url, {
        role,
      });
      router.refresh();
      onOpen('manageMembers', { server: response.data });
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingId('');
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-center">
            {server?.members?.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[420px] mt-8 pr-6">
          {server?.members?.map((member) => (
            <div key={member.id} className="flex items-center gap-x-2 mb-6">
              <UserAvatar src={member?.profile?.imageUrl} />
              <div className="flex flex-col gap-y-1">
                <div className="gap-x-2 text-xs font-semibold flex items-center">
                  {member?.profile?.name}
                  {roleIconMap[member?.role]}
                </div>
                <p className="text-xs text-zinc-500">
                  {member?.profile?.email}
                </p>
              </div>
              {server?.profileId !== member?.profileId &&
                member?.id !== loadingId && (
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left" align="end">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center">
                            <ShieldQuestion className="h-4 w-4 mr-2" />
                            <span>Role</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  member?.role !== 'MODERATOR' &&
                                  onRoleChange(member?.id, 'MODERATOR')
                                }
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                <span>Moderator</span>
                                {member?.role === 'MODERATOR' && (
                                  <Check className="h-4 w-4" />
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  member?.role !== 'GUEST' &&
                                  onRoleChange(member?.id, 'GUEST')
                                }
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                <span>Guest</span>
                                {member?.role === 'GUEST' && (
                                  <Check className="h-4 w-4 ml-auto" />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onKick(member?.id)}>
                          <Gavel className="h-4 w-4 mr-2 text-rose-500" />
                          <span>Kick</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              {loadingId === member?.id && (
                <Loader2 className="animate-spin h-4 w-4 text-zinc-500 ml-auto" />
              )}
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ManageMembers;
