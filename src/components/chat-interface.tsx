'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, Answers } from '@/lib/types';
import { questions } from '@/lib/questions';
import { understandUserSymptoms } from '@/ai/flows/understand-user-symptoms';
import { useToast } from '@/hooks/use-toast';

import { ChatMessages } from '@/components/chat-messages';
import { ChatInput } from '@/components/chat-input';
import { PainScale } from '@/components/pain-scale';
import { ChoiceButtons } from '@/components/choice-buttons';
import { BodyModel } from '@/components/body-model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isBotLoading, setIsBotLoading] = useState(false);
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), ...message }]);
  }, []);

  useEffect(() => {
    addMessage({ sender: 'bot', text: questions[0].text });
  }, [addMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const advanceQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      const message: Omit<Message, 'id'> = { sender: 'bot' };
      
      if(nextQuestion.type === 'summary') {
        message.content = (
          <Card className="bg-transparent border-primary">
            <CardHeader>
              <CardTitle>Symptom Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Concern:</strong> {answers.understanding}</p>
              <p><strong>Location:</strong> {answers.location}</p>
              <p><strong>Pain Level:</strong> {answers['pain-scale']}/10</p>
              <p><strong>Duration:</strong> {answers.duration}</p>
            </CardContent>
          </Card>
        );
      } else {
        message.text = nextQuestion.text;
      }

      setTimeout(() => addMessage(message), 500);

    }
  }, [currentQuestionIndex, addMessage, answers]);
  
  const handleAnswer = useCallback((key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    advanceQuestion();
  }, [advanceQuestion]);

  const handleSubmitInitial = async (symptomDescription: string) => {
    addMessage({ sender: 'user', text: symptomDescription });
    setIsBotLoading(true);
    addMessage({ sender: 'bot', isLoading: true });

    try {
      const { understoodSymptoms } = await understandUserSymptoms({ symptomDescription });
      setMessages(prev => prev.slice(0, -1)); // Remove loading message
      setAnswers(prev => ({ ...prev, initial: symptomDescription, understanding: understoodSymptoms }));
      addMessage({ sender: 'bot', text: `I see, you're experiencing: ${understoodSymptoms}.` });
      advanceQuestion();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Could not understand symptoms. Please try again.', variant: 'destructive' });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsBotLoading(false);
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsBotLoading(false);
    addMessage({ sender: 'bot', text: questions[0].text });
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <ChatMessages messages={messages} />
      <div ref={bottomRef} />

      <div className="p-4 shrink-0">
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
    </div>
  );
}
