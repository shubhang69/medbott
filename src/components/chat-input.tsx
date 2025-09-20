'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UseAudioRecorder } from '@/hooks/use-audio-recorder';

interface ChatInputProps {
  onSubmit: (value: string, audioDataUri?: string) => void;
  isLoading: boolean;
  audioRecorder: UseAudioRecorder;
}

export function ChatInput({ onSubmit, isLoading, audioRecorder }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { startRecording, stopRecording, isRecording, audioDataUri } = audioRecorder;

  useEffect(() => {
    if (!isRecording && audioDataUri && !inputValue) {
      // We don't need to do anything here because the chat-interface handles submission
    }
  }, [isRecording, audioDataUri, inputValue, onSubmit]);

  const handleTextSubmit = () => {
     if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue);
      setInputValue('');
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  return (
    <div className="flex w-full items-center gap-3 p-4">
      <div className="relative flex-1">
        <Input
          placeholder={isRecording ? 'Listening...' : 'Enter patient symptoms and history...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading || isRecording}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleTextSubmit();
            }
          }}
          className="w-full rounded-full bg-secondary py-6 pl-5 pr-14 text-base"
        />
        {!isRecording && inputValue && (
           <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full"
            onClick={handleTextSubmit}
            disabled={isLoading}
          >
            <Send />
          </Button>
        )}
      </div>

      <Button
        type="button"
        size="icon"
        variant="default"
        onClick={toggleRecording}
        className={cn(
          "relative h-14 w-14 flex-shrink-0 rounded-full transition-all duration-300",
          isRecording ? 'bg-destructive scale-100' : 'bg-primary'
        )}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        disabled={isLoading}
      >
        <Mic className={cn("z-10 h-6 w-6")} />
      </Button>
    </div>
  );
}
