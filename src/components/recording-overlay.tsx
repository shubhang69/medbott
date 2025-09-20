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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-hidden">
        <SoundWave />
      </div>

      <div className="z-10 flex flex-col items-center text-center text-foreground">
        <Mic className="h-16 w-16 mb-4 text-primary animate-pulse" />
        <p className="mt-4 text-2xl font-semibold">Listening...</p>
        <p className="mt-1 text-muted-foreground">
          Describe the patient's symptoms.
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
