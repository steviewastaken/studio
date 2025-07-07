
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Message = {
  id: string;
  sender: 'user' | 'ai' | 'admin';
  text: string;
  timestamp: string;
  rating?: 'good' | 'bad' | null;
  language?: string;
};

export type ChatSession = {
  id: string;
  userId: string;
  status: 'AI Handling' | 'Needs Attention' | 'Resolved';
  lastMessage: string;
  messages: Message[];
};

const initialChats: ChatSession[] = [];


type ChatContextType = {
  chats: ChatSession[];
  addMessageToChat: (chatId: string, message: { text: string; sender: 'user' | 'ai' | 'admin'; language?: string; }, userInfo?: { userId: string; }) => void;
  rateMessage: (chatId: string, messageId: string, rating: 'good' | 'bad') => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<ChatSession[]>(initialChats);

  const addMessageToChat = (
      chatId: string, 
      message: { text: string; sender: 'user' | 'ai' | 'admin'; language?: string },
      userInfo?: { userId: string }
    ) => {
    setChats(prevChats => {
      const chatExists = prevChats.some(chat => chat.id === chatId);

      if (!chatExists) {
        // Create a new chat session if it doesn't exist
        const newChat: ChatSession = {
          id: chatId,
          userId: userInfo?.userId || `user-${chatId.slice(-6)}`,
          status: 'Needs Attention', // New chats from contact form or new user need attention
          lastMessage: message.text,
          messages: [{
            id: `msg-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rating: null,
            ...message
          }]
        };
        // Add new chat to the beginning of the list
        return [newChat, ...prevChats];
      }

      // If chat exists, update it and move it to the top
      let updatedChat: ChatSession | null = null;
      const otherChats = prevChats.filter(chat => {
          if (chat.id === chatId) {
              const newMessage: Message = {
                id: `msg-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                rating: null,
                ...message
              };
              updatedChat = {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  lastMessage: newMessage.text,
                  status: message.sender === 'user' ? 'Needs Attention' : chat.status,
              };
              return false; // Remove from list to re-insert at the top
          }
          return true;
      });

      return updatedChat ? [updatedChat, ...otherChats] : otherChats;
    });
  };

  const rateMessage = (chatId: string, messageId: string, rating: 'good' | 'bad') => {
    setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
            const updatedMessages = chat.messages.map(msg => 
                msg.id === messageId ? { ...msg, rating } : msg
            );
            return { ...chat, messages: updatedMessages };
        }
        return chat;
    }));
  };

  return (
    <ChatContext.Provider value={{ chats, addMessageToChat, rateMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
