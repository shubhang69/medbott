'use client';

import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SoundWave } from '@/components/sound-wave';

interface RecordingOverlayProps {
  isRecording: boolean;
  stopRecording: () => void;
}

export function RecordingOverlay({ isRecording, stopRecording }: RecordingOverlayProps) {
  if (!isRecording) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-lg animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute top-0 flex h-full w-full items-center justify-center overflow-hidden">
        <SoundWave />
      </div>

      <div className="z-10 flex flex-col items-center text-center text-foreground">
        <Mic className="h-16 w-16" />
        <p className="mt-4 text-2xl font-semibold">Listening...</p>
        <p className="mt-1 text-muted-foreground">
          Tell me how you are feeling.
        </p>

        <Button
          onClick={stopRecording}
          variant="destructive"
          size="lg"
          className="mt-12 rounded-full"
        >
          <Square className="mr-2 h-5 w-5" />
          Stop Recording
        </Button>
      </div>
    </div>
  );
}
