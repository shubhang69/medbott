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
            message.sender === 'user' && 'justify-end'
          )}
        >
          {message.sender === 'bot' && (
            <Avatar className="w-8 h-8 shrink-0 bg-primary/20 text-primary">
              <AvatarFallback className="bg-transparent">
                <Stethoscope size={20} />
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={cn(
              'max-w-[80%] rounded-2xl p-3 px-4 text-sm',
              message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
            )}
          >
            {message.isLoading ? (
              <div className="flex items-center space-x-2">
                <Skeleton className="w-3 h-3 rounded-full animate-bounce" />
                <Skeleton className="w-3 h-3 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                <Skeleton className="w-3 h-3 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
              </div>
            ) : (
              message.text || message.content
            )}
          </div>

          {message.sender === 'user' && (
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback>
                <User size={20} />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  );
}
