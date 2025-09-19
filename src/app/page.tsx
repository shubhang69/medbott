'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background overflow-hidden">
      <div className="flex flex-col items-center justify-center flex-1 space-y-6">
        <div style={{ animationDelay: '0.1s' }} className="opacity-0 animate-fade-in">
          <Logo animated={true} className="w-32 h-32" />
        </div>
        <h1 style={{ animationDelay: '0.6s' }} className="text-5xl font-bold tracking-tighter text-foreground opacity-0 animate-fade-in font-headline md:text-6xl">
          MediMind
        </h1>
        <p style={{ animationDelay: '0.9s' }} className="text-lg text-muted-foreground max-w-md opacity-0 animate-fade-in">
          Your intelligent health assistant. Log your symptoms with a simple conversation.
        </p>
      </div>
      <div style={{ animationDelay: '1.3s' }} className="w-full max-w-sm opacity-0 animate-fade-in">
        <Button size="lg" className="w-full text-lg h-14" asChild>
          <Link href="/chat">
            GET STARTED
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
