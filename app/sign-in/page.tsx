'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-background text-foreground border border-border',
            headerTitle: 'text-foreground',
            headerSubtitle: 'text-muted-foreground',
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
            formFieldLabel: 'text-foreground',
            formFieldInput: 'bg-background text-foreground border border-input',
            footerActionLink: 'text-primary hover:text-primary/90',
            identityPreviewText: 'text-foreground',
            formResendCodeLink: 'text-primary hover:text-primary/90',
          },
        }}
        redirectUrl={redirectUrl || '/dashboard'}
      />
    </div>
  );
}