'use client';

import { useState, useRef } from 'react';

type AudioRecorderHook = {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => Promise<void>;
  audioDataUri: string | null;
};

export function useAudioRecorder(): AudioRecorderHook {
  const [isRecording, setIsRecording] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            setAudioDataUri(reader.result as string);
          };
          
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  const stopRecording = async (): Promise<void> => {
     return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.addEventListener('stop', () => resolve(), { once: true });
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } else {
        resolve();
      }
    });
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioDataUri,
  };
}