
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { translations, type Translation } from '@/lib/translations';

// This gets the type of a single language's translations, e.g., typeof translations['en']
type LanguageContent = Translation[keyof Translation];

// Define the shape of the context.
type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  content: LanguageContent; // The translated content is now part of the context
};

// Create the context with a default undefined value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<string>('en'); // Default language is English

  // This side-effect updates the lang attribute on the html tag whenever the language changes.
  useEffect(() => {
    if (document.documentElement.lang !== language) {
        document.documentElement.lang = language;
    }
  }, [language]);

  // The content object is now calculated here, within the provider.
  const content = useMemo(() => {
    return translations[language as keyof typeof translations] || translations.en;
  }, [language]);


  // The value provided to consumers now includes the content.
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

// Custom hook to use the language context. It now simply returns the context value.
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
