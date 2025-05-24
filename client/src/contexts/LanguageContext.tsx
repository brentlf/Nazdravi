import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { i18n } from "@/lib/i18n";
import { Language } from "@/types";
import { translations } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, namespace?: string, params?: Record<string, string>) => string;
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
  const [language, setLanguageState] = useState<Language>(i18n.getCurrentLanguage());

  const setLanguage = (lang: Language) => {
    i18n.setLanguage(lang);
    setLanguageState(lang);
  };

  const t = (key: string, namespace = "common", params?: Record<string, string>) => {
    try {
      // First try to get translation in current language
      const currentLangTranslation = (translations as any)[language]?.[namespace]?.[key];
      if (currentLangTranslation) {
        return currentLangTranslation;
      }
      
      // Fallback to English if not found in current language
      const englishTranslation = (translations as any)['en']?.[namespace]?.[key];
      if (englishTranslation) {
        return englishTranslation;
      }
      
      // Final fallback to the key itself
      return key;
    } catch (error) {
      return key;
    }
  };

  useEffect(() => {
    // Set initial language state
    setLanguageState(i18n.getCurrentLanguage());
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
