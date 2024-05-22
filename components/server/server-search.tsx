'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface ServerSearchProps {
  data: {
    type: 'channel' | 'member';
    label: string;
    data?: {
      id: string;
      icon: React.ReactNode;
      name: string;
    }[];
  }[];
}

export const ServerSearch = ({ data }: ServerSearchProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', onKeyPress);
    return () => document.removeEventListener('keydown', onKeyPress);
  }, []);

  const onClick = ({
    type,
    id,
  }: {
    type: 'channel' | 'member';
    id: string;
  }) => {
    if (type === 'channel') {
      return router.push(`/servers/${params?.serverId}/channels/${id}`);
    }
    return router.push(`/servers/${params?.serverId}/conversations/${id}`);
  };

  return (
    <>
      <button
        className="group px-2 py-2 rounded-md flex gap-x-2 items-center w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
          Search
        </p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto dark:group-hover:text-zinc-300 group-hover:text-zinc-700">
          <span>Ctrl</span>
          <span>+</span>
          <span>K</span>
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search channels and members..." />
        <CommandList>
          <CommandEmpty>No channels or members found</CommandEmpty>
          {data?.map(({ label, type, data }) => {
            if (!data?.length) {
              return null;
            }
            return (
              <CommandGroup key={label} heading={label}>
                {data?.map(({ icon, id, name }) => (
                  <CommandItem key={id} onSelect={() => onClick({ type, id })}>
                    {icon}
                    <span>{name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};
