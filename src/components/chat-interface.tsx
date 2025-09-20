'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, Answers } from '@/lib/types';
import { questions } from '@/lib/questions';
import { summarizeSymptomDescription } from '@/ai/flows/summarize-symptom-description';
import { useToast } from '@/hooks/use-toast';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { ChatMessages } from '@/components/chat-messages';
import { ChatInput } from '@/components/chat-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecordingOverlay } from '@/components/recording-overlay';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-message',
      sender: 'bot',
      text: questions[0].text,
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isBotLoading, setIsBotLoading] = useState(false);
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRecorder = useAudioRecorder();

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { id: Date.now().toString() + Math.random(), ...message }]);
  }, []);

  const handleRestart = useCallback(() => {
    if (messages.length > 1) {
       setMessages([
        {
          id: 'initial-message',
          sender: 'bot',
          text: questions[0].text,
        },
      ]);
    }
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsBotLoading(false);
  }, [messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAudioSubmit = useCallback(async (audioDataUri: string, fileName?: string) => {
    const content = fileName 
      ? `Uploaded: ${fileName}` 
      : <audio controls src={audioDataUri} className="w-full" />;
    
    addMessage({ sender: 'user', content: content });
    setIsBotLoading(true);
    const transcribingMessageId = 'transcribing-loader';
    addMessage({ sender: 'bot', text: 'Transcribing audio...', id: transcribingMessageId });
  
    try {
      const { transcription } = await transcribeAudio({ audioDataUri });
      
      setMessages(prev => prev.filter(m => m.id !== transcribingMessageId));
      setMessages(prev => prev.filter(m => typeof m.content !== 'object')); // Remove the audio player/upload message

      if (transcription && transcription.trim()) {
        handleSubmitInitial(transcription);
      } else {
         addMessage({ sender: 'bot', text: 'Transcription was empty. Please try again.'});
         setIsBotLoading(false);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: 'Error', description: `Could not transcribe audio. ${errorMessage}`, variant: 'destructive' });
      setMessages(prev => prev.filter(m => m.id !== transcribingMessageId));
      setIsBotLoading(false);
    }
  }, [addMessage, toast]);
  
  const handleFileUpload = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const audioDataUri = reader.result as string;
        handleAudioSubmit(audioDataUri, file.name);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({ title: "Error", description: "Could not read the uploaded file.", variant: "destructive"});
      };
    }
  }


  useEffect(() => {
    if (audioRecorder.audioDataUri && !audioRecorder.isRecording) {
      handleAudioSubmit(audioRecorder.audioDataUri);
    }
  }, [audioRecorder.audioDataUri, audioRecorder.isRecording, handleAudioSubmit]);

  const advanceQuestion = useCallback((newAnswers?: Answers) => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      const message: Omit<Message, 'id'> = { sender: 'bot' };
      
      if(nextQuestion.type === 'summary') {
        const finalAnswers = { ...answers, ...newAnswers };
        message.content = (
          <Card className="bg-secondary/50 border-primary/30">
            <CardHeader>
              <CardTitle>Case Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Case Details:</strong> {finalAnswers.caseDetails}</p>
              <p><strong>Analysis:</strong> {finalAnswers.analysis}</p>
            </CardContent>
          </Card>
        );
         setTimeout(() => addMessage(message), 500);
         setTimeout(() => {
            const finalQuestion = questions[nextIndex + 1];
            if (finalQuestion) {
              setCurrentQuestionIndex(nextIndex + 1);
              addMessage({sender: 'bot', text: finalQuestion.text});
            }
         }, 1000);

      } else {
        message.text = nextQuestion.text;
        setTimeout(() => addMessage(message), 500);
      }
    }
  }, [currentQuestionIndex, addMessage, answers]);
  
  const handleSubmitInitial = async (symptomDescription: string) => {
    addMessage({ sender: 'user', text: symptomDescription });
    setIsBotLoading(true);
    
    setMessages(prev => {
      if (prev.some(m => m.isLoading)) return prev;
      return [...prev, { sender: 'bot', isLoading: true, id: 'loading' }];
    });

    try {
      const { summary } = await summarizeSymptomDescription({ symptomDescription });
      setMessages(prev => prev.filter(m => !m.isLoading));
      
      const newAnswers = { caseDetails: symptomDescription, analysis: summary };
      setAnswers(newAnswers);
      
      addMessage({ sender: 'bot', text: `Thank you, Doctor. I am analyzing the case...` });
      
      // Pass newAnswers directly to advanceQuestion
      advanceQuestion(newAnswers);

    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not process case. Please try again.', variant: 'destructive' });
      setMessages(prev => prev.filter(m => !m.isLoading));
    } finally {
      setIsBotLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <RecordingOverlay isRecording={audioRecorder.isRecording} stopRecording={audioRecorder.stopRecording} />
      <ChatMessages messages={messages} />
      <div ref={bottomRef} />

      <div className="p-4 shrink-0 bg-background/0">
        {!isBotLoading && currentQuestion && (
          <div className="animate-fade-in">
            {currentQuestion.type === 'initial' && <ChatInput onSubmit={handleSubmitInitial} onFileSubmit={handleFileUpload} isLoading={isBotLoading} audioRecorder={audioRecorder} />}
            {currentQuestion.type === 'final' && (
              <div className="text-center">
                <Button onClick={handleRestart}>Start New Case</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
