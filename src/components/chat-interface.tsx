"use client";

import { useState, useRef, useEffect } from "react";
import type { Message, Answers } from "@/lib/types";
import { questions } from "@/lib/questions";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordingOverlay } from "@/components/recording-overlay";
import { TranscriptionOverlay } from "@/components/transcription-overlay";
import { transcribeAudio } from "@/ai/flows/transcribe-audio";
import { useChatHistory } from "@/hooks/use-chat-history";
import { ArrowLeft } from "lucide-react";
import { useGetInitialState } from "@/logic/chat-interface-logic";
import {
  sendCaseToNgrok,
  handleAudioSubmit,
} from "@/logic/chat-interface-logic";

interface ChatInterfaceProps {
  conversationId: string;
  onNewChat: () => void;
  sendMessage: (conversationId: string, message: string) => Promise<void>;
}

export function ChatInterface({
  conversationId,
  onNewChat,
  sendMessage,
}: ChatInterfaceProps) {
  const { getConversation, saveConversation } = useChatHistory();

  // Use the extracted useGetInitialState function
  const getInitialState = useGetInitialState(conversationId);

  const [messages, setMessages] = useState<Message[]>(
    getInitialState().messages
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    getInitialState().questionIndex
  );
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

  const addMessage = (message: Omit<Message, "id">) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        ...message,
        text: message.text || "", // Ensure text is always defined
        content: message.content || null, // Add support for content
      },
    ]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper function to send case to ngrok backend with simplified headers
  async function sendCaseToNgrok(symptomDescription: string) {
    const url = "https://5796209a4fff.ngrok-free.app/compose_case";
    const payload = { symptomDescription };
    const headers = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, ngrok-skip-browser-warning",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send case to backend: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in sendCaseToNgrok:", error);
      throw error;
    }
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () =>
      handleAudioSubmit(
        reader.result as string,
        file.name,
        addMessage,
        sendMessage,
        conversationId
      );
    reader.onerror = (err) => {
      console.error("Error reading file:", err);
      toast({
        title: "Error",
        description: "Could not read the uploaded file.",
        variant: "destructive",
      });
    };
  };

  useEffect(() => {
    if (audioRecorder.audioDataUri && !audioRecorder.isRecording) {
      handleAudioSubmit(
        audioRecorder.audioDataUri,
        undefined,
        addMessage,
        sendMessage,
        conversationId
      );
      audioRecorder.clearAudioData();
    }
  }, [
    audioRecorder.audioDataUri,
    audioRecorder.isRecording,
    addMessage,
    sendMessage,
    conversationId,
    audioRecorder,
  ]);

  const advanceQuestion = (newAnswers?: Answers) => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      const message: Omit<Message, "id"> = { sender: "bot" };

      // Remove summary card logic
      message.text = nextQuestion.text;
      setTimeout(() => addMessage(message), 500);
    }
  };

  const handleSubmitInitial = async (symptomDescription: string) => {
    addMessage({ sender: "user", text: symptomDescription });
    setIsBotLoading(true);

    setMessages((prev) => {
      if (prev.some((m) => m.isLoading)) return prev;
      return [...prev, { sender: "bot", isLoading: true, id: "loading" }];
    });

    try {
      setMessages((prev) => prev.filter((m) => !m.isLoading));

      const backendResponse = await sendCaseToNgrok(symptomDescription);

      // Map the response to a detailed UI message
      const detailedMessage = (
        <div className="space-y-4">
          <p className="font-bold">Patient Problem:</p>
          <p>{backendResponse.final_diagnosis.patient_problem}</p>

          <p className="font-bold">Possible Diagnoses:</p>
          <ul className="list-disc list-inside">
            {backendResponse.final_diagnosis.diagnosis.map(
              (diag: string, index: number) => (
                <li key={index}>{diag}</li>
              )
            )}
          </ul>

          <p className="font-bold">Simplified Diagnoses:</p>
          <ul className="list-disc list-inside">
            {backendResponse.final_diagnosis.diagnosis_simplified.map(
              (diag: string, index: number) => (
                <li key={index}>{diag}</li>
              )
            )}
          </ul>

          <p className="font-bold">Metadata:</p>
          <ul className="list-disc list-inside">
            {Object.entries(backendResponse.final_diagnosis.metadata).map(
              ([key, value], index) => (
                <li key={index}>
                  <strong>{key}:</strong>{" "}
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </li>
              )
            )}
          </ul>

          <p className="font-bold">Treatment Plan:</p>
          <ul className="list-disc list-inside">
            <li>
              <strong>Medications:</strong>{" "}
              {backendResponse.final_diagnosis.treatment_plan.medications.join(
                ", "
              )}
            </li>
            <li>
              <strong>Lifestyle Modifications:</strong>{" "}
              {backendResponse.final_diagnosis.treatment_plan.lifestyle_modifications.join(
                ", "
              )}
            </li>
          </ul>
        </div>
      );

      addMessage({ sender: "bot", content: detailedMessage });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not process case. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => !m.isLoading));
    } finally {
      setIsBotLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-background">
      <RecordingOverlay
        isRecording={audioRecorder.isRecording}
        stopRecording={audioRecorder.stopRecording}
      />
      <TranscriptionOverlay isTranscribing={isTranscribing} />
      <header className="flex items-center gap-4 border-b bg-secondary/30 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Diagnostic Assistant</h2>
      </header>
      <ChatMessages messages={messages} />
      <div ref={bottomRef} />

      <div className="p-4 shrink-0 bg-background/0">
        {!isBotLoading && currentQuestion && (
          <div className="animate-fade-in">
            {currentQuestion.type === "initial" && (
              <ChatInput
                onSubmit={handleSubmitInitial}
                onFileSubmit={handleFileUpload}
                isLoading={isBotLoading}
                audioRecorder={audioRecorder}
              />
            )}
            {currentQuestion.type === "final" && (
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
