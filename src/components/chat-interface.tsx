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
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isBotLoading, setIsBotLoading] = useState(false);
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRecorder = useAudioRecorder();

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { id: Date.now().toString() + Math.random(), ...message }]);
  }, []);

  useEffect(() => {
    addMessage({ sender: 'bot', text: questions[0].text });
  }, [addMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (audioRecorder.audioDataUri) {
      handleTranscription(audioRecorder.audioDataUri);
    }
  }, [audioRecorder.audioDataUri, audioRecorder.audioDataUri]);

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
  
  const handleTranscription = async (audioDataUri: string) => {
    addMessage({ sender: 'user', content: <audio controls src={audioDataUri} className="w-full" /> });
    setIsBotLoading(true);
    addMessage({ sender: 'bot', isLoading: true });

    try {
      const { transcription } = await transcribeAudio({ audioDataUri });
      if (transcription) {
        handleSubmitInitial(transcription);
      } else {
        throw new Error('Transcription failed.');
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not transcribe audio. Please try again or type your message.', variant: 'destructive' });
      setMessages(prev => prev.filter(m => !m.isLoading));
      setIsBotLoading(false);
    }
  };
  
  const handleSubmitInitial = async (symptomDescription: string) => {
    addMessage({ sender: 'user', text: symptomDescription });
    setIsBotLoading(true);
    setMessages(prev => prev.filter(m => typeof m.content === 'undefined'));
    
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

  const handleRestart = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsBotLoading(false);
    setTimeout(() => addMessage({ sender: 'bot', text: questions[0].text }), 200);
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
            {currentQuestion.type === 'initial' && <ChatInput onSubmit={handleSubmitInitial} isLoading={isBotLoading} audioRecorder={audioRecorder} />}
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
