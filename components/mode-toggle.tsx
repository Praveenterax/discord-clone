'use client';
import * as React from 'react';
import { Check, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const selectedMode = <Check className="h-4 w-4 ml-auto" />;

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const renderDropDownItem = ['light', 'dark', 'system'].map((mode) => (
    <DropdownMenuItem onClick={() => setTheme(mode)} key={mode}>
      <span className="capitalize">{mode}</span>
      {theme === mode && selectedMode}
    </DropdownMenuItem>
  ));
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-transparent border-0 w-[48px] h-[48px]"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {renderDropDownItem}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
