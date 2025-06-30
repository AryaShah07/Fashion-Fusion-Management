'use client';

import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const { signOut } = useAuth();

  return (
    <Button
      variant="ghost"
      onClick={() => signOut()}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
} 