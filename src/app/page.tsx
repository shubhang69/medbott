'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Soundwave } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <div className="relative mx-auto flex h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border-8 border-gray-800 bg-background shadow-2xl">
        <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-8 text-center">
          <div style={{ animationDelay: '0.1s' }} className="opacity-0 animate-fade-in">
            <Logo className="w-24 h-24" />
          </div>
          <h1 style={{ animationDelay: '0.6s' }} className="text-5xl font-bold tracking-tighter text-foreground opacity-0 animate-fade-in font-headline">
            MediTalk
          </h1>
          <p style={{ animationDelay: '0.9s' }} className="text-md text-muted-foreground max-w-xs opacity-0 animate-fade-in">
            Empowering your health journey with the best conversations
          </p>
        </div>
        <div style={{ animationDelay: '1.3s' }} className="w-full p-4 opacity-0 animate-fade-in">
          <Button size="lg" className="w-full text-lg h-16 rounded-2xl bg-primary/90 hover:bg-primary" asChild>
            <Link href="/chat">
              <Soundwave size={28} />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
