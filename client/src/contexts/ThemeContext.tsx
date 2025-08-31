import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Theme } from "@/types";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
  isSystemTheme: boolean;
  systemPreference: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem("theme") as Theme;
    if (saved && ["light", "dark", "system"].includes(saved)) {
      return saved;
    }
    return "system";
  });

  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");
  const [systemPreference, setSystemPreference] = useState<"light" | "dark">("light");

  useEffect(() => {
    const updateTheme = () => {
      let newTheme: "light" | "dark";
      
      if (theme === "system") {
        newTheme = systemPreference;
      } else {
        newTheme = theme;
      }
      
      setActualTheme(newTheme);
      
      // Apply theme classes with smooth transitions
      const root = document.documentElement;
      
      if (newTheme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
      
      // Add transition class for smooth theme changes
      root.classList.add("theme-transitioning");
      setTimeout(() => {
        root.classList.remove("theme-transitioning");
      }, 300);
    };

    updateTheme();
  }, [theme, systemPreference]);

  useEffect(() => {
    // Get initial system preference
    const getSystemPreference = () => {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    setSystemPreference(getSystemPreference());

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newPreference = e.matches ? "dark" : "light";
      setSystemPreference(newPreference);
      
      // If using system theme, update immediately
      if (theme === "system") {
        setActualTheme(newPreference);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      const root = document.documentElement;
      root.classList.add("theme-transitioning");
      setTimeout(() => {
        root.classList.remove("theme-transitioning");
      }, 300);
    }, 10);
  };

  const isSystemTheme = theme === "system";

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme: handleSetTheme, 
        actualTheme, 
        isSystemTheme,
        systemPreference 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
