import { ChatInterface } from '@/components/chat-interface';
import { Logo } from '@/components/logo';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-4 p-4 border-b shrink-0">
        <Logo className="w-10 h-10" />
        <h1 className="text-xl font-bold font-headline">MediMind</h1>
      </header>
      <ChatInterface />
    </div>
  );
}
