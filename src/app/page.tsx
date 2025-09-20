'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function Home() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRedirecting(true);
    }, 2000); // Logo visible for 2 seconds

    const redirectTimer = setTimeout(() => {
      router.push('/chat');
    }, 3500); // Start fade-out and redirect after another 1.5 seconds

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background">
       <div className={`transition-opacity duration-1000 ${isRedirecting ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <Logo className="w-24 h-24 animate-glow" />
          <h1 className="text-4xl font-bold tracking-tighter text-foreground font-headline">
            MediMind
          </h1>
        </div>
      </div>
    </main>
  );
}
