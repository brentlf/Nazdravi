import { createContext, useContext, useEffect, ReactNode } from "react";
import { i18n } from "@/lib/i18n";
import { Language } from "@/types";

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
  const language = i18n.getCurrentLanguage();

  const setLanguage = (lang: Language) => {
    i18n.setLanguage(lang);
    // Force re-render by updating the component
    window.location.reload();
  };

  const t = (key: string, namespace = "common", params?: Record<string, string>) => {
    return i18n.translate(key, namespace, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
