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
import { TranscriptionOverlay } from '@/components/transcription-overlay';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { useChatHistory } from '@/hooks/use-chat-history';
import { ArrowLeft } from 'lucide-react';

interface ChatInterfaceProps {
  conversationId: string;
  onNewChat: () => void;
}

export function ChatInterface({ conversationId, onNewChat }: ChatInterfaceProps) {
  const { getConversation, saveConversation } = useChatHistory();

  // Initialize state from a function to avoid re-running on every render
  const getInitialState = useCallback(() => {
    if (!conversationId.startsWith('new_')) {
      const existingConversation = getConversation(conversationId);
      if (existingConversation && existingConversation.messages.length > 0) {
        
        const lastBotMessage = existingConversation.messages
            .slice()
            .reverse()
            .find((m) => m.sender === 'bot');

        // Find the index of the last question asked
        const lastQuestion = questions.find(q => q.text === lastBotMessage?.text);
        const questionIndex = lastQuestion ? questions.indexOf(lastQuestion) : 0;
        
        return {
          messages: existingConversation.messages,
          questionIndex: questionIndex,
          answers: existingConversation.answers || {},
        };
      }
    }
    // Default state for a new chat
    return {
      messages: [{ id: 'initial-message', sender: 'bot', text: questions[0].text }],
      questionIndex: 0,
      answers: {},
    };
  }, [conversationId, getConversation]);

  const [messages, setMessages] = useState<Message[]>(getInitialState().messages);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(getInitialState().questionIndex);
  const [answers, setAnswers] = useState<Answers>(getInitialState().answers);
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRecorder = useAudioRecorder();
  
  // Effect for saving conversation to history
  useEffect(() => {
    // Only save if there's more than the initial bot message
    if (messages.length > 1) {
      saveConversation(conversationId, messages, answers);
    }
  }, [messages, answers, conversationId, saveConversation]);
  

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    setMessages((prev) => [...prev, { id: Date.now().toString() + Math.random(), ...message }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAudioSubmit = useCallback(async (audioDataUri: string, fileName?: string) => {
    addMessage({ sender: 'ui', content: fileName ? `Uploaded: ${fileName}` : <audio controls src={audioDataUri} className="w-full" /> });
    setIsTranscribing(true);
  
    try {
      const match = audioDataUri.match(/^data:(.*);base64,(.*)$/);
      if (!match) throw new Error('Invalid audio data URI format.');
      
      const [_, mimeType, audioData] = match;
      
      const { transcription } = await transcribeAudio({ audioData, mimeType, language: 'en' });
      
      // Remove the UI placeholder for the audio element/file name
      setMessages(prev => prev.filter(m => m.sender !== 'ui'));

      if (transcription && transcription.trim()) {
        handleSubmitInitial(transcription);
      } else {
         addMessage({ sender: 'bot', text: 'Transcription was empty. Please try again.'});
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({ title: 'Error', description: `Could not transcribe audio. ${errorMessage}`, variant: 'destructive' });
      // Clean up UI placeholders on error
      setMessages(prev => prev.filter(m => m.sender !== 'ui'));
    } finally {
      setIsTranscribing(false);
    }
  }, [addMessage, toast]);
  
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => handleAudioSubmit(reader.result as string, file.name);
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast({ title: "Error", description: "Could not read the uploaded file.", variant: "destructive"});
    };
  };

  useEffect(() => {
    if (audioRecorder.audioDataUri && !audioRecorder.isRecording) {
      handleAudioSubmit(audioRecorder.audioDataUri);
      audioRecorder.clearAudioData();
    }
  }, [audioRecorder.audioDataUri, audioRecorder.isRecording, handleAudioSubmit, audioRecorder]);

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
      setAnswers(prevAnswers => ({...prevAnswers, ...newAnswers}));
      
      addMessage({ sender: 'bot', text: `Thank you, Doctor. I am analyzing the case...` });
      
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
    <div className="flex flex-col flex-1 h-full min-h-0 bg-background">
      <RecordingOverlay isRecording={audioRecorder.isRecording} stopRecording={audioRecorder.stopRecording} />
      <TranscriptionOverlay isTranscribing={isTranscribing} />
      <header className="flex items-center gap-4 border-b bg-secondary/30 p-4">
        <Button variant="ghost" size="icon" onClick={onNewChat} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Diagnostic Assistant</h2>
      </header>
      <ChatMessages messages={messages} />
      <div ref={bottomRef} />

      <div className="p-4 shrink-0 bg-background/0">
        {!isBotLoading && currentQuestion && (
          <div className="animate-fade-in">
            {currentQuestion.type === 'initial' && <ChatInput onSubmit={handleSubmitInitial} onFileSubmit={handleFileUpload} isLoading={isBotLoading} audioRecorder={audioRecorder} />}
            {currentQuestion.type === 'final' && (
              <div className="text-center">
                <Button onClick={onNewChat}>Start New Case</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
