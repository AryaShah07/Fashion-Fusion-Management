import { auth } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScissorsIcon } from 'lucide-react';

export default async function Home() {
  const { userId } = auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <div className="flex items-center space-x-2">
            <ScissorsIcon className="h-12 w-12" />
            <h1 className="text-4xl font-bold">Fashion Fusion Management</h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            Professional tailor shop management system with customer tracking, measurements, orders, and automated reminders.
          </p>

          <div className="grid gap-4">
            {userId ? (
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button size="lg">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}