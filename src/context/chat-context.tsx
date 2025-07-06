
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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

const initialChats: ChatSession[] = [
  {
    id: 'guest-support-chat-1',
    userId: 'user-guest',
    status: 'AI Handling',
    lastMessage: 'Ok, that makes sense. Thanks!',
    messages: [
      { id: 'm1-1', sender: 'user', text: 'Hi, where is my package?', timestamp: '10:30 AM', rating: null },
      { id: 'm1-2', sender: 'ai', text: 'Hello! I can help with that. Could you please provide your tracking ID?', timestamp: '10:31 AM', rating: 'good' },
      { id: 'm1-3', sender: 'user', text: 'It\'s DNLVR-801', timestamp: '10:31 AM', rating: null },
      { id: 'm1-4', sender: 'ai', text: 'Thanks! Your package is currently in transit with our courier, Alexandre Dubois, and is estimated to arrive at the Eiffel Tower within the next 25 minutes.', timestamp: '10:32 AM', rating: null },
      { id: 'm1-5', sender: 'user', text: 'Ok, that makes sense. Thanks!', timestamp: '10:33 AM', rating: null }
    ]
  },
  {
    id: 'chat-2',
    userId: 'user-xyz',
    status: 'Needs Attention',
    lastMessage: 'This is ridiculous, I want a refund now!',
    messages: [
      { id: 'm2-1', sender: 'user', text: 'My package is an hour late!!', timestamp: '10:40 AM', rating: null },
      { id: 'm2-2', sender: 'ai', text: 'I understand your frustration with the delay. Delays can occasionally happen due to unforeseen traffic. I see your delivery is more than 2 hours past its ETA, which makes you eligible for a refund of the delivery fee.', timestamp: '10:41 AM', rating: 'bad' },
      { id: 'm2-3', sender: 'user', text: 'This is ridiculous, I want a refund now!', timestamp: '10:42 AM', rating: null }
    ]
  },
  {
    id: 'chat-3',
    userId: 'user-def',
    status: 'Resolved',
    lastMessage: 'Perfect, thank you for your help.',
    messages: [
       { id: 'm3-1', sender: 'user', text: 'Can I change my delivery address?', timestamp: '11:00 AM', rating: null },
       { id: 'm3-2', sender: 'ai', text: 'Yes, you can request a reroute from the tracking page. There may be an additional fee depending on the new location.', timestamp: '11:01 AM', rating: 'good' },
       { id: 'm3-3', sender: 'user', text: 'Perfect, thank you for your help.', timestamp: '11:02 AM', rating: null }
    ]
  }
].sort((a, b) => { // Keep "Needs Attention" on top initially
    if (a.status === 'Needs Attention' && b.status !== 'Needs Attention') return -1;
    if (a.status !== 'Needs Attention' && b.status === 'Needs Attention') return 1;
    return 0;
});


type ChatContextType = {
  chats: ChatSession[];
  addMessageToChat: (chatId: string, message: { text: string; sender: 'user' | 'ai' | 'admin'; language?: string; }, userInfo?: { userId: string; }) => void;
  rateMessage: (chatId: string, messageId: string, rating: 'good' | 'bad') => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<ChatSession[]>(initialChats);

  const addMessageToChat = useCallback((
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
  }, []);

  const rateMessage = useCallback((chatId: string, messageId: string, rating: 'good' | 'bad') => {
    setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
            const updatedMessages = chat.messages.map(msg => 
                msg.id === messageId ? { ...msg, rating } : msg
            );
            return { ...chat, messages: updatedMessages };
        }
        return chat;
    }));
  }, []);

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
