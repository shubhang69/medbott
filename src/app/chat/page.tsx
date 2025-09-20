import { ChatInterface } from '@/components/chat-interface';

export default function ChatPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-blurry-gradient">
       <div className="relative mx-auto flex h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border-4 border-primary/20 bg-background/80 shadow-2xl backdrop-blur-xl">
        <ChatInterface />
      </div>
    </main>
  );
}
