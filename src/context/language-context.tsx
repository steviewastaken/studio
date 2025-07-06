"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { translations, type Translation } from '@/lib/translations';

// This gets the type of a single language's translations, e.g., typeof translations['en']
type LanguageContent = Translation[keyof Translation];

// Define the shape of the context
type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  content: LanguageContent;
};

// Create the context with a default undefined value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<string>('en'); // Default language is English

  // useMemo will re-calculate the content object only when the language changes
  const content = useMemo(() => {
    return translations[language as keyof typeof translations] || translations.en;
  }, [language]);

  // The value provided to consumers now includes the content object
  const value = { language, setLanguage, content };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
