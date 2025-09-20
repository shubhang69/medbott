import { useCallback } from "react";
import { questions } from "@/lib/questions";
import type { Message } from "@/lib/types";
import { useChatHistory } from "@/hooks/use-chat-history";
import { transcribeAudio } from "@/ai/flows/transcribe-audio";
import { toast } from "@/hooks/use-toast";
import React from "react";

/**
 * Initializes the state for the chat interface based on the conversation ID.
 * @param conversationId - The ID of the conversation.
 * @returns The initial state including messages, question index, and answers.
 */
export const useGetInitialState = (conversationId: string) => {
  const { getConversation } = useChatHistory();

  return useCallback(() => {
    if (!conversationId.startsWith("new_")) {
      const existingConversation = getConversation(conversationId);
      if (existingConversation && existingConversation.messages.length > 0) {
        const lastBotMessage = existingConversation.messages
          .slice()
          .reverse()
          .find((m) => m.sender === "bot");

        // Find the index of the last question asked
        const lastQuestion = questions.find(
          (q) => q.text === lastBotMessage?.text
        );
        const questionIndex = lastQuestion
          ? questions.indexOf(lastQuestion)
          : 0;

        return {
          messages: existingConversation.messages,
          questionIndex: questionIndex,
          answers: existingConversation.answers || {},
        };
      }
    }
    // Default state for a new chat
    return {
      messages: [
        {
          id: "initial-message",
          sender: "bot",
          text: questions[0].text,
        } as Message,
      ],
      questionIndex: 0,
      answers: {},
    };
  }, [conversationId, getConversation]);
};

/**
 * Sends a symptom description to the ngrok backend.
 * @param symptomDescription - The description of the symptoms.
 * @returns The backend response.
 */
export async function sendCaseToNgrok(symptomDescription: string) {
  const url = "https://5796209a4fff.ngrok-free.app/compose_case";
  const payload = { symptomDescription };
  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
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

/**
 * Handles audio submission by transcribing the audio and sending the message.
 * @param audioDataUri - The audio data URI.
 * @param fileName - The name of the uploaded file (optional).
 * @param addMessage - Function to add a message to the chat.
 * @param sendMessage - Function to send a message.
 * @param conversationId - The ID of the conversation.
 */
export const handleAudioSubmit = async (
  audioDataUri: string,
  fileName: string | undefined,
  addMessage: (message: Omit<Message, "id">) => void,
  sendMessage: (conversationId: string, message: string) => Promise<void>,
  conversationId: string
) => {
  addMessage({
    sender: "ui",
    content: fileName
      ? `Uploaded: ${fileName}`
      : `<audio controls src='${audioDataUri}' class='w-full'></audio>`,
  });

  try {
    const match = audioDataUri.match(/^data:(.*);base64,(.*)$/);
    if (!match) throw new Error("Invalid audio data URI format.");

    const [_, mimeType, audioData] = match;
    const { transcription } = await transcribeAudio({
      audioData,
      mimeType,
      language: "en",
    });

    // Remove the UI placeholder for the audio element/file name
    addMessage({ sender: "ui", content: "" });

    if (transcription && transcription.trim()) {
      // Send the transcribed text using sendMessage
      await sendMessage(conversationId, transcription);
    } else {
      addMessage({
        sender: "bot",
        text: "Transcription was empty. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error in handleAudioSubmit:", error);
    toast({
      title: "Error",
      description: `Could not transcribe audio. ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      variant: "destructive",
    });
    // Clean up UI placeholders on error
    addMessage({ sender: "ui", content: "" });
  }
};

/**
 * Returns a temporary response for UI testing.
 * @returns A simulated backend response.
 */
export const getTempResponse = () => {
  return {
    final_diagnosis: {
      patient_problem:
        "Mr. Singh presents with a three-month history of progressively worsening insomnia, now refractory to medication, accompanied by visual hallucinations and unintentional weight loss of 10 kg. He also reports recent memory issues and tremors. There is a family history of severe insomnia and early death in an uncle. Given the rapid progression and constellation of symptoms, possible diagnoses include prion disease, autoimmune encephalitis, or a paraneoplastic syndrome. The plan involves blood work, sleep study, genetic screening, and consideration of counseling for support and symptom management.",
      diagnosis: [
        "Prion disease",
        "Autoimmune encephalitis",
        "Paraneoplastic syndrome",
      ],
      diagnosis_simplified: [
        "A rare brain disease caused by misfolded proteins",
        "Inflammation of the brain caused by the immune system attacking itself",
        "A condition where cancer causes the immune system to attack the nervous system",
      ],
      metadata: {
        sex: "male",
        body_system: "neurology",
        symptom_tags: [
          "insomnia",
          "hallucinations",
          "weight loss",
          "memory issues",
          "tremors",
        ],
        abha_id: "",
      },
      treatment_plan: {
        medications: [],
        lifestyle_modifications: [
          "Counseling for support and symptom management",
        ],
      },
    },
  };
};

/**
 * Simulates a backend response for UI testing.
 * @param addMessage - Function to add a message to the chat.
 */
export const simulateBackendResponse = (
  addMessage: (message: Omit<Message, "id">) => void
) => {
  const tempResponse = getTempResponse();

  const detailedMessage = `
    <div class='space-y-4'>
      <p class='font-bold'>Patient Problem:</p>
      <p>${tempResponse.final_diagnosis.patient_problem}</p>

      <p class='font-bold'>Possible Diagnoses:</p>
      <ul class='list-disc list-inside'>
        ${tempResponse.final_diagnosis.diagnosis
          .map((diag) => `<li>${diag}</li>`)
          .join("")}
      </ul>

      <p class='font-bold'>Simplified Diagnoses:</p>
      <ul class='list-disc list-inside'>
        ${tempResponse.final_diagnosis.diagnosis_simplified
          .map((diag) => `<li>${diag}</li>`)
          .join("")}
      </ul>

      <p class='font-bold'>Treatment Plan:</p>
      <ul class='list-disc list-inside'>
        ${tempResponse.final_diagnosis.treatment_plan.lifestyle_modifications
          .map((modification) => `<li>${modification}</li>`)
          .join("")}
      </ul>
    </div>
  `;

  addMessage({
    sender: "bot",
    content: detailedMessage,
  });
};

/**
 * Handles sending a message in the chat.
 * @param conversationId - The ID of the conversation.
 * @param message - The message text.
 * @param addMessage - Function to add a message to the chat.
 */
export const handleSendMessage = async (
  conversationId: string,
  message: string,
  addMessage: (message: Omit<Message, "id">) => void
) => {
  // Add the user's message to the chat
  addMessage({
    sender: "user",
    text: message,
  });

  // Simulate backend response for UI testing
  // TODO: Remove simulateBackendResponse once the actual backend integration is complete
  simulateBackendResponse(addMessage);

  try {
    // Here you would send the message to the actual backend
    // const response = await sendMessageToBackend(conversationId, message);
    // Process the response and add it to the chat
  } catch (error) {
    console.error("Error sending message:", error);
    addMessage({
      sender: "bot",
      text: "There was an error processing your message. Please try again.",
    });
  }
};
