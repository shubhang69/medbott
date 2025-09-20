'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message } from '@/lib/types';

const CHAT_HISTORY_KEY = 'medimind-chat-history';

export function useChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedHistory) {
        const parsedHistory: Conversation[] = JSON.parse(storedHistory);
        // Sort by last modified date, newest first
        parsedHistory.sort((a, b) => b.lastModified - a.lastModified);
        setConversations(parsedHistory);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
    }
  }, []);

  const saveToLocalStorage = (history: Conversation[]) => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  };
  
  const getConversation = useCallback((id: string): Conversation | undefined => {
    return conversations.find(c => c.id === id);
  }, [conversations]);


  const saveConversation = useCallback((id: string, messages: Message[]) => {
    setConversations(prev => {
        const existingConversation = prev.find(c => c.id === id);
        let newConversations: Conversation[];
        
        if (existingConversation) {
            // Update existing conversation
            newConversations = prev.map(c => 
                c.id === id ? { ...c, messages, lastModified: Date.now() } : c
            );
        } else {
            // Create new conversation
            const userMessage = messages.find(m => m.sender === 'user' && typeof m.text === 'string');
            const title = (userMessage?.text as string)?.substring(0, 40) + '...' || 'New Case';

            const newConversation: Conversation = {
                id,
                title,
                messages,
                createdAt: Date.now(),
                lastModified: Date.now(),
            };
            newConversations = [newConversation, ...prev];
        }

        // Sort by last modified date, newest first
        newConversations.sort((a, b) => b.lastModified - a.lastModified);
        saveToLocalStorage(newConversations);
        return newConversations;
    });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const newConversations = prev.filter(c => c.id !== id);
      saveToLocalStorage(newConversations);
      return newConversations;
    });
  }, []);

  return { conversations, getConversation, saveConversation, deleteConversation };
}
