'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send, Square } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { text, startListening, stopListening, isListening, hasRecognitionSupport } = useSpeechRecognition();

  useEffect(() => {
    if (text) {
      setInputValue(text);
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSubmit(inputValue);
      setInputValue('');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4">
      {hasRecognitionSupport && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleListening}
          className={isListening ? 'text-primary animate-pulse' : ''}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <Square /> : <Mic />}
        </Button>
      )}
      <Input
        type="text"
        placeholder="Type here..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading || isListening}
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} aria-label="Send message">
        <Send />
      </Button>
    </form>
  );
}
