import { FloatingOrganic, DoodleConnector } from "@/components/ui/PageTransition";

interface OrganicPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  backgroundVariant?: "primary" | "accent" | "muted" | "neutral";
  className?: string;
}

export function OrganicPageWrapper({
  children,
  title,
  subtitle,
  showHeader = true,
  backgroundVariant = "neutral",
  className = ""
}: OrganicPageWrapperProps) {
  const backgroundClasses = {
    primary: "bg-primary/5",
    accent: "bg-accent/5",
    muted: "bg-muted",
    neutral: "bg-background"
  };

  return (
    <div className={`min-h-screen py-20 ${backgroundClasses[backgroundVariant]} country-texture relative overflow-hidden ${className}`}>
      <div className="container mx-auto px-4 relative z-10">
        {showHeader && (title || subtitle) && (
          <div className="text-center mb-12 relative">
            {title && (
              <div className="doodle-arrow mb-4">
                <h1 className="font-display text-3xl md:text-4xl mb-4 text-foreground handwritten-accent">
                  {title}
                </h1>
              </div>
            )}
            {subtitle && (
              <p className="serif-body text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
            
            {/* Connecting doodle */}
            <DoodleConnector direction="down" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24" />
          </div>
        )}

        {children}
      </div>
      
      {/* Floating background elements */}
      <FloatingOrganic className="absolute top-20 -right-20 opacity-15" size="large" delay={1} />
      <FloatingOrganic className="absolute bottom-20 -left-20 opacity-15" size="large" delay={3} />
      <FloatingOrganic className="absolute top-1/2 right-10 opacity-10" size="medium" delay={2} />
      <FloatingOrganic className="absolute bottom-1/3 left-10 opacity-10" size="medium" delay={4} />
    </div>
  );
}