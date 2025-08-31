import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { Theme } from "@/types";

const themes: { value: Theme; label: string; icon: any; description: string }[] = [
  { 
    value: "light", 
    label: "Light", 
    icon: Sun, 
    description: "Warm neutral colors" 
  },
  { 
    value: "dark", 
    label: "Dark", 
    icon: Moon, 
    description: "Rich sophisticated dark" 
  },
  { 
    value: "system", 
    label: "System", 
    icon: Monitor, 
    description: "Follows your device" 
  },
];

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const getCurrentIcon = () => {
    if (theme === "system") {
      return actualTheme === "dark" ? Moon : Sun;
    }
    return theme === "dark" ? Moon : Sun;
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 w-9 p-0 relative group transition-all duration-300 hover:bg-accent/10"
          aria-label="Toggle theme"
        >
          <CurrentIcon className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
          <span className="sr-only">Toggle theme</span>
          
          {/* Theme indicator dot */}
          <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-primary/60 transition-all duration-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 animate-in slide-in-from-top-2 duration-200"
      >
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isActive = theme === themeOption.value;
          const isSystemActive = theme === "system" && themeOption.value === "system";
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`cursor-pointer transition-all duration-200 ${
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "hover:bg-accent/5"
              } ${isSystemActive ? "ring-1 ring-primary/20" : ""}`}
            >
              <div className="flex items-center w-full">
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{themeOption.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {themeOption.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-primary ml-2" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        
        {/* Current theme info */}
        <div className="px-2 py-1.5 text-xs text-muted-foreground border-t mt-1 pt-1">
          Current: {actualTheme === "dark" ? "Dark" : "Light"} mode
          {theme === "system" && " (System)"}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
