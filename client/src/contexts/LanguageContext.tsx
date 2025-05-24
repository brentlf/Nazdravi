import { createContext, useContext, ReactNode } from "react";

interface LanguageContextType {
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

// Simple function to convert kebab-case keys to readable English
function keyToEnglish(key: string): string {
  return key
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Simple translation function that converts keys to readable English
  const t = (key: string, namespace?: string, params?: Record<string, string>) => {
    // Convert kebab-case keys to readable English
    return keyToEnglish(key);
  };

  const value: LanguageContextType = {
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}