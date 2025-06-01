import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div className={`page-transition ${isTransitioning ? 'page-exit-active' : 'page-enter-active'}`}>
      {children}
    </div>
  );
}

// Floating organic decoration component
export function FloatingOrganic({ 
  className = "", 
  delay = 0,
  size = "medium" 
}: { 
  className?: string;
  delay?: number;
  size?: "small" | "medium" | "large";
}) {
  const sizeClasses = {
    small: "w-16 h-12",
    medium: "w-24 h-18", 
    large: "w-32 h-24"
  };

  return (
    <div 
      className={`floating-element blob-shape bg-primary/5 ${sizeClasses[size]} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

// Handwritten doodle connector
export function DoodleConnector({ 
  direction = "right",
  className = ""
}: {
  direction?: "left" | "right" | "up" | "down";
  className?: string;
}) {
  const rotationClasses = {
    right: "rotate-12",
    left: "-rotate-12", 
    up: "rotate-90",
    down: "-rotate-90"
  };

  return (
    <div className={`doodle-line ${rotationClasses[direction]} ${className}`} />
  );
}

// Organic image wrapper for seamless integration
export function OrganicImage({ 
  src, 
  alt, 
  className = "",
  shape = "blob",
  size = "medium"
}: {
  src: string;
  alt: string;
  className?: string;
  shape?: "blob" | "organic" | "fluid";
  size?: "small" | "medium" | "large" | "hero";
}) {
  const shapeClasses = {
    blob: "blob-shape",
    organic: "organic-image", 
    fluid: "clip-path-[ellipse(100%_85%_at_50%_0%)]"
  };

  const sizeClasses = {
    small: "w-32 h-32",
    medium: "w-48 h-48",
    large: "w-64 h-64", 
    hero: "w-full h-96 lg:h-[500px]"
  };

  return (
    <div className={`${shapeClasses[shape]} overflow-hidden ${sizeClasses[size]} ${className}`}>
      <img 
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
      />
    </div>
  );
}