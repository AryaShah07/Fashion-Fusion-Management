'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScissorsIcon } from 'lucide-react';
import { LogoutButton } from './logout-button';

const navigation = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Customers', href: '/dashboard/customers' },
  { name: 'Measurements', href: '/dashboard/measurements' },
  { name: 'Orders', href: '/dashboard/orders' },
  { name: 'Payments', href: '/dashboard/payments' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <ScissorsIcon className="h-6 w-6" />
            <span className="text-xl font-semibold">Fashion Fusion</span>
          </div>

          <div className="ml-8 flex space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <LogoutButton />
      </div>
    </nav>
  );
}