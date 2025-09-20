'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, Answers } from '@/lib/types';
import { questions } from '@/lib/questions';
import { understandUserSymptoms } from '@/ai/flows/understand-user-symptoms';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { ChatMessages } from '@/components/chat-messages';
import { ChatInput } from '@/components/chat-input';
import { PainScale } from '@/components/pain-scale';
import { ChoiceButtons } from '@/components/choice-buttons';
import { BodyModel } from '@/components/body-model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [isBotLoading, setIsBotLoading] = useState(false);
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { id: Date.now().toString() + Math.random(), ...message }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const advanceQuestion = useCallback((newAnswers?: Answers) => {
    const nextIndex = (currentQuestionIndex ?? -1) + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      const message: Omit<Message, 'id'> = { sender: 'bot' };
      
      if(nextQuestion.type === 'summary') {
        const finalAnswers = { ...answers, ...newAnswers };
        message.content = (
          <Card className="bg-secondary/50 border-primary/30">
            <CardHeader>
              <CardTitle>Symptom Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Concern:</strong> {finalAnswers.understanding}</p>
              <p><strong>Location:</strong> {finalAnswers.location}</p>
              <p><strong>Pain Level:</strong> {finalAnswers['pain-scale']}/10</p>
              <p><strong>Duration:</strong> {finalAnswers.duration}</p>
            </CardContent>
          </Card>
        );
         setTimeout(() => addMessage(message), 500);
         // Advance again to the final message
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
  
  const handleAnswer = useCallback((key: string, value: any) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    if(key === 'duration') { // last question before summary
      advanceQuestion(newAnswers);
    } else {
      advanceQuestion();
    }
  }, [advanceQuestion, answers]);

  const startConversation = () => {
    setCurrentQuestionIndex(0);
    addMessage({ sender: 'bot', text: questions[0].text });
  };
  
  const handleSubmitInitial = async (symptomDescription: string) => {
    addMessage({ sender: 'user', text: symptomDescription });
    setIsBotLoading(true);
    addMessage({ sender: 'bot', isLoading: true });

    try {
      const { understoodSymptoms } = await understandUserSymptoms({ symptomDescription });
      setMessages(prev => prev.filter(m => !m.isLoading));
      setAnswers(prev => ({ ...prev, initial: symptomDescription, understanding: understoodSymptoms }));
      addMessage({ sender: 'bot', text: `I see, you're experiencing: ${understoodSymptoms}.` });
      advanceQuestion();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not understand symptoms. Please try again.', variant: 'destructive' });
      setMessages(prev => prev.filter(m => !m.isLoading));
    } finally {
      setIsBotLoading(false);
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setCurrentQuestionIndex(null);
    setAnswers({});
    setIsBotLoading(false);
  };

  const currentQuestion = currentQuestionIndex !== null ? questions[currentQuestionIndex] : null;

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <header className="flex items-center gap-2 p-4 border-b shrink-0 border-primary/20">
        <Logo className="text-2xl" />
        <h1 className="text-xl font-bold font-headline">MediMind</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        {currentQuestionIndex === null ? (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 animate-fade-in">
                <p className="text-muted-foreground">
                    Welcome to MediMind.
                </p>
                <p className="text-muted-foreground">
                    Tap below to start a new conversation about your symptoms.
                </p>
                <div className="p-4">
                  <Button className="w-full h-16 rounded-2xl text-lg" onClick={startConversation}>
                    <MessageCircle className="mr-2" /> Start Conversation
                  </Button>
                </div>
            </div>
        ) : (
          <ChatMessages messages={messages} />
        )}
      </div>
      <div ref={bottomRef} />

      {currentQuestionIndex !== null && (
        <div className="p-4 shrink-0 bg-background/0">
          {!isBotLoading && currentQuestion && (
            <div className="animate-fade-in">
              {currentQuestion.type === 'initial' && <ChatInput onSubmit={handleSubmitInitial} isLoading={isBotLoading} />}
              {currentQuestion.type === 'location' && <BodyModel onSelect={(part) => handleAnswer('location', part)} />}
              {currentQuestion.type === 'pain-scale' && <PainScale onSelect={(val) => handleAnswer('pain-scale', val)} />}
              {currentQuestion.type === 'duration' && currentQuestion.options && <ChoiceButtons options={currentQuestion.options} onSelect={(val) => handleAnswer('duration', val)} />}
              {currentQuestion.type === 'final' && (
                <div className="text-center">
                  <Button onClick={handleRestart}>Start Over</Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
