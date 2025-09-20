'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BotMessageSquare } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col bg-background text-foreground">
      <header className="absolute top-0 z-20 flex w-full items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <h1 className="text-lg font-bold">MediMind</h1>
        </div>
        <nav className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" asChild>
            <Link href="#">About</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#">Features</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#">Contact</Link>
          </Button>
        </nav>
        <Button asChild>
          <Link href="/chat">
            Launch Platform <ArrowRight />
          </Link>
        </Button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-8 text-center">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Smarter Medical AI Brain,
            <br />
            Brighter Human Life.
          </h2>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Enhancing medical insights with an advanced AI Brain platform,
            delivering smarter diagnostics, optimized treatments, and a
            healthier future for all.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild className="bg-primary/90 hover:bg-primary">
              <Link href="/chat">
                <BotMessageSquare className="mr-2" /> Explore the Platform
              </Link>
            </Button>
            <Button size="lg" variant="secondary">
              Request a Demo
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
