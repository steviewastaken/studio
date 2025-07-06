
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { translations, type Translation } from '@/lib/translations';

// This gets the type of a single language's translations, e.g., typeof translations['en']
type LanguageContent = Translation[keyof Translation];

// Define the shape of the context. We only need to store the language code and the setter.
type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
};

// Define the shape of the hook's return value.
type UseLanguageReturnType = LanguageContextType & {
  content: LanguageContent;
};

// Create the context with a default undefined value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<string>('en'); // Default language is English

  // The value provided only contains the state and the setter.
  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage(): UseLanguageReturnType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  // The content object is derived here, inside the hook.
  // This creates a direct dependency on the language state for any component that uses this hook.
  const content = useMemo(() => {
    return translations[context.language as keyof typeof translations] || translations.en;
  }, [context.language]);

  return { ...context, content };
}
