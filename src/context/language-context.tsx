
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { translations, type Translation } from '@/lib/translations';

// This gets the type of a single language's translations, e.g., typeof translations['en']
export type LanguageContent = Translation[keyof Translation];

// Define the shape of the context.
type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  content: LanguageContent; // The direct translations object
};

// Create the context with a default undefined value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<string>('en'); // Default language is English

  // Memoize the content to only change when the language changes.
  const content = useMemo(() => {
    return translations[language as keyof typeof translations] || translations.en;
  }, [language]);

  // The value provided to consumers includes the direct content object.
  const value = useMemo(() => ({
    language,
    setLanguage,
    content,
  }), [language, content]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context.
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
