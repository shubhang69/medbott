'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { MessageCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChatInterface } from '@/components/chat-interface';

export default function ChatPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background bg-blurry-gradient p-4">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <Logo className="mb-6 h-28 w-28" />
          <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
            Hi, I'm MediMind
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Your personal AI health assistant. I can help you understand your symptoms.
          </p>
        </div>
      </div>

      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetTrigger asChild>
          <div className="flex w-full max-w-md flex-col items-center">
            <Button
              size="lg"
              className="w-full rounded-full bg-primary/90 text-lg font-semibold shadow-lg backdrop-blur-sm transition-all hover:bg-primary/100 hover:shadow-xl"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageCircle className="mr-2" />
              Chat about your symptoms
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              MediMind is not a replacement for a doctor.
            </p>
          </div>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl border-t-4 border-primary bg-background">
          <SheetHeader className="sr-only">
            <SheetTitle>Chat Interface</SheetTitle>
          </SheetHeader>
          <ChatInterface />
        </SheetContent>
      </Sheet>
    </main>
  );
}