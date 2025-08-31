import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Monitor, Palette, Sparkles } from "lucide-react";

export function ThemeDemo() {
  const { theme, actualTheme, isSystemTheme, systemPreference } = useTheme();

  return (
    <div className="space-y-6 p-6">
      {/* Theme Status Card */}
      <Card className="theme-aware-card border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Current Theme Status
          </CardTitle>
          <CardDescription>
            See how the new theme system works with warm neutral colors and sophisticated dark mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Theme:</p>
              <Badge variant="secondary" className="w-full justify-center">
                {theme === "system" ? (
                  <Monitor className="mr-2 h-3 w-3" />
                ) : theme === "dark" ? (
                  <Moon className="mr-2 h-3 w-3" />
                ) : (
                  <Sun className="mr-2 h-3 w-3" />
                )}
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Actual Theme:</p>
              <Badge variant="outline" className="w-full justify-center">
                {actualTheme === "dark" ? (
                  <Moon className="mr-2 h-3 w-3" />
                ) : (
                  <Sun className="mr-2 h-3 w-3" />
                )}
                {actualTheme.charAt(0).toUpperCase() + actualTheme.slice(1)}
              </Badge>
            </div>
          </div>
          
          {isSystemTheme && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                <Monitor className="inline mr-2 h-3 w-3" />
                System preference: <strong>{systemPreference}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Color Palette Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Warm Colors (Light Theme) */}
        <Card className="theme-aware-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-warm-600" />
              Warm Neutral Palette
            </CardTitle>
            <CardDescription>
              Comfortable, warm neutral colors for the light theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {[50, 100, 200, 300, 400].map((shade) => (
                <div
                  key={shade}
                  className={`h-12 rounded-lg border border-border bg-warm-${shade} flex items-center justify-center`}
                  title={`Warm ${shade}`}
                >
                  <span className="text-xs font-medium text-warm-700">{shade}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[500, 600, 700, 800, 900].map((shade) => (
                <div
                  key={shade}
                  className={`h-12 rounded-lg border border-border bg-warm-${shade} flex items-center justify-center`}
                  title={`Warm ${shade}`}
                >
                  <span className="text-xs font-medium text-warm-100">{shade}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dark Colors */}
        <Card className="theme-aware-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-dark-400" />
              Dark Theme Palette
            </CardTitle>
            <CardDescription>
              Rich, sophisticated dark colors for elegant dark mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {[50, 100, 200, 300, 400].map((shade) => (
                <div
                  key={shade}
                  className={`h-12 rounded-lg border border-border bg-dark-${shade} flex items-center justify-center`}
                  title={`Dark ${shade}`}
                >
                  <span className="text-xs font-medium text-dark-700">{shade}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[500, 600, 700, 800, 900].map((shade) => (
                <div
                  key={shade}
                  className={`h-12 rounded-lg border border-border bg-dark-${shade} flex items-center justify-center`}
                  title={`Dark ${shade}`}
                >
                  <span className="text-xs font-medium text-dark-100">{shade}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Elements Demo */}
      <Card className="theme-aware-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Interactive Elements
          </CardTitle>
          <CardDescription>
            Test the new hover effects and theme-aware styling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button className="hover-lift">Primary Button</Button>
            <Button variant="secondary" className="hover-lift">Secondary</Button>
            <Button variant="outline" className="hover-lift">Outline</Button>
            <Button variant="ghost" className="hover-lift">Ghost</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border hover-lift cursor-pointer">
              <h4 className="font-medium mb-2">Hover Me</h4>
              <p className="text-sm text-muted-foreground">This card lifts on hover</p>
            </div>
            <div className="p-4 rounded-lg bg-muted hover-lift cursor-pointer">
              <h4 className="font-medium mb-2">Muted Card</h4>
              <p className="text-sm text-muted-foreground">With subtle background</p>
            </div>
            <div className="p-4 rounded-lg bg-accent text-accent-foreground hover-lift cursor-pointer">
              <h4 className="font-medium mb-2">Accent Card</h4>
              <p className="text-sm opacity-90">With accent colors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Utilities Demo */}
      <Card className="theme-aware-card">
        <CardHeader>
          <CardTitle>Theme Utility Classes</CardTitle>
          <CardDescription>
            New utility classes for theme-aware styling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Warm Theme Utilities</h4>
              <div className="space-y-2">
                <div className="p-3 rounded bg-warm-subtle border border-warm-subtle">
                  <span className="text-warm-primary font-medium">bg-warm-subtle</span>
                </div>
                <div className="p-3 rounded bg-warm-gradient border border-warm-subtle">
                  <span className="text-warm-primary font-medium">bg-warm-gradient</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Dark Theme Utilities</h4>
              <div className="space-y-2">
                <div className="p-3 rounded bg-dark-subtle border border-dark-subtle">
                  <span className="text-dark-primary font-medium">bg-dark-subtle</span>
                </div>
                <div className="p-3 rounded bg-dark-gradient border border-dark-subtle">
                  <span className="text-dark-primary font-medium">bg-dark-gradient</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Theme-Aware Utilities</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 rounded theme-aware-bg theme-aware-border border text-center">
                <span className="text-sm font-medium">theme-aware-bg</span>
              </div>
              <div className="p-3 rounded theme-aware-card border text-center">
                <span className="text-sm font-medium">theme-aware-card</span>
              </div>
              <div className="p-3 rounded bg-muted theme-aware-border border text-center">
                <span className="text-sm font-medium">theme-aware-border</span>
              </div>
              <div className="p-3 rounded bg-background theme-aware-text text-center">
                <span className="text-sm font-medium">theme-aware-text</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
