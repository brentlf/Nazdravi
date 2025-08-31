import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentLanguage, setLanguage as setLanguageStorage } from "@/lib/globalTranslationFunction";
import type { Language } from "@/types";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage());

  const handleSetLanguage = (lang: Language) => {
    try {
      setLanguageState(lang);
      setLanguageStorage(lang);
      
      // Update document language attribute for accessibility
      document.documentElement.lang = lang;
      
      // Trigger a custom event for components that need to react to language changes
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    } catch (error) {
      console.error('Failed to set language:', error);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    try {
      if (params) {
        return require('@/lib/globalTranslationFunction').gtWithParams(key, params, language);
      }
      return require('@/lib/globalTranslationFunction').gt(key, language);
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  useEffect(() => {
    // Set initial document language
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}