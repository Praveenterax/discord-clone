import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/components/providers/socket-provider';
import { MessageWithMemberAndProfile } from '@/types';

type ChatSocketProps = {
  queryKey: string;
  addKey: string;
  updateKey: string;
};

export const useChatSocket = ({
  addKey,
  queryKey,
  updateKey,
}: ChatSocketProps) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket?.on(updateKey, (message: MessageWithMemberAndProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData?.pages || oldData?.pages?.length === 0) {
          return oldData;
        }
        const newData = oldData.pages.map((page: any) => {
          return {
            ...page,
            items: page?.items?.map((item: MessageWithMemberAndProfile) => {
              if (message.id === item.id) {
                return message;
              }
              return item;
            }),
          };
        });
        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    socket?.on(addKey, (message: MessageWithMemberAndProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData?.pages || oldData?.pages?.length === 0) {
          return {
            pages: [
              {
                items: [message],
              },
            ],
          };
        }
        const newData = [...oldData.pages];
        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0]?.items],
        };
        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    return () => {
      socket?.off(addKey);
      socket?.off(updateKey);
    };
  }, [socket, queryClient, addKey, updateKey, queryKey]);
};
