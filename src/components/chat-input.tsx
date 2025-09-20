'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send, Square } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSubmit: (value: string, audioDataUri?: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { startRecording, stopRecording, isRecording, audioDataUri } = useAudioRecorder();

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

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
      // The audioDataUri will be set in the hook and can be used on submit
    } else {
      startRecording();
      setInputValue(''); // Clear text input when starting to record
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
          placeholder={isRecording ? 'Listening...' : 'Tell me how you are feeling...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading || isRecording}
          className="w-full pr-12"
        />
        {!isRecording && inputValue && (
           <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2"
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
        variant="ghost"
        onClick={toggleRecording}
        className={cn(
          "relative h-12 w-12 rounded-full transition-all duration-300",
          isRecording ? 'bg-primary/20 scale-110' : 'bg-secondary'
        )}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording && (
          <>
            <div className="absolute inset-0 z-0 animate-waveform rounded-full border-2 border-primary" />
            <div className="absolute inset-0 z-0 animate-waveform rounded-full border-2 border-primary" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-0 z-0 animate-waveform rounded-full border-2 border-primary" style={{ animationDelay: '1s' }} />
          </>
        )}
        <Mic className={cn("z-10", isRecording && "text-primary")} />
      </Button>
    </div>
  );
}