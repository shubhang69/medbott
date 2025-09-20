import { ChatInterface } from '@/components/chat-interface';
import { Logo } from '@/components/logo';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';


export default function ChatPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
       <div className="relative mx-auto flex h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border-8 border-gray-800 bg-background shadow-2xl">
        <header className="flex items-center gap-2 p-4 border-b shrink-0">
          <Logo className="text-2xl" />
          <h1 className="text-xl font-bold font-headline">MediTalk</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <p className="text-muted-foreground">
                Welcome to MediTalk.
            </p>
            <p className="text-muted-foreground">
                Tap below to start a new conversation about your symptoms.
            </p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <div className="p-4">
              <Button className="w-full h-16 rounded-2xl text-lg">
                <MessageCircle className="mr-2" /> Start Conversation
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl border-t-4 border-primary bg-background">
              <ChatInterface />
          </SheetContent>
        </Sheet>
      </div>
    </main>
  );
}
