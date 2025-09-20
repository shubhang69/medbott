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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in bg-blurry-gradient"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full overflow-hidden">
        <SoundWave />
      </div>
      
      <div className="relative flex h-64 w-64 items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute h-full w-full rounded-full border border-primary/30"
            style={{
              animation: `ripple 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
        <Mic className="h-16 w-16 text-primary" />
      </div>


      <div className="z-10 flex flex-col items-center text-center text-foreground mt-8">
        <p className="text-2xl font-semibold">Listening...</p>
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
