'use client';

import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Stethoscope, User } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex items-start gap-3',
            message.sender === 'user' && 'flex-row-reverse'
          )}
        >
          {message.sender === 'bot' && (
            <Avatar className="h-8 w-8 shrink-0 border-2 border-primary/50 bg-primary/20 text-primary">
              <AvatarFallback className="bg-transparent">
                <Stethoscope size={18} />
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
              message.sender === 'user'
                ? 'rounded-br-none bg-primary text-primary-foreground'
                : 'rounded-bl-none bg-secondary',
              'animate-fade-in-scale'
            )}
          >
            {message.isLoading ? (
              <div className="flex items-center space-x-2 p-1">
                <Skeleton className="h-2 w-2 rounded-full animate-bounce" />
                <Skeleton className="h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <Skeleton className="h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            ) : (
              message.text || message.content
            )}
          </div>

          {message.sender === 'user' && (
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>
                <User size={18} />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  );
}
