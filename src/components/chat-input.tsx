'use client';

import { useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      if (isRecording) {
        stopRecording();
      }
      onSubmit(inputValue, audioDataUri);
      setInputValue('');
    }
  };

  const handleTextSubmit = () => {
     if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue);
      setInputValue('');
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
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          "relative h-14 w-14 flex-shrink-0 rounded-full transition-all duration-300",
          isRecording ? 'bg-destructive scale-100' : 'bg-primary'
        )}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <Mic className={cn("z-10 h-6 w-6")} />
      </Button>
    </div>
  );
}
