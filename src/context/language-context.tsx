
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { translations, type Translation } from '@/lib/translations';

// This gets the type of a single language's translations, e.g., typeof translations['en']
export type LanguageContent = Translation[keyof Translation];

// Define the shape of the context.
type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  // The `t` function replaces the direct `content` object to prevent re-renders.
  t: (key: keyof LanguageContent) => string;
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

  // The `t` function provides translations without causing consumers to re-render.
  // It's memoized with useCallback so its reference remains stable.
  const t = useCallback((key: keyof LanguageContent): string => {
    const content = translations[language as keyof typeof translations] || translations.en;
    return content[key] || key;
  }, [language]);


  // The value provided to consumers now includes the `t` function.
  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, t]);

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
