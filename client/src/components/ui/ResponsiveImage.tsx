import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  width?: number;
  height?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * ResponsiveImage component that handles responsive images with proper sizing
 * and optimization for different viewport sizes
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  sizes = "(max-width: 320px) 100vw, (max-width: 375px) 100vw, (max-width: 414px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw",
  priority = false,
  quality = 75,
  fill = false,
  width,
  height,
  placeholder = 'empty',
  blurDataURL,
  ...props
}) => {
  // For now, we'll use a regular img tag with responsive classes
  // In a production app, you'd want to use next/image or a similar optimized image component
  
  const imageClasses = cn(
    // Base responsive image styles
    "w-full h-auto object-cover",
    // Responsive sizing
    "max-w-full",
    // Prevent layout shift
    "transition-opacity duration-300",
    // Mobile optimizations
    "xs:max-w-full sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full",
    // Height constraints for different viewports
    "max-h-[50vh] xs:max-h-[60vh] sm:max-h-[70vh] md:max-h-[80vh]",
    // Landscape phone optimizations
    "landscape:max-h-[40vh] landscape:object-top",
    // Short screen optimizations
    "h-short-adjust:max-h-[30vh] h-short-adjust:object-top",
    className
  );

  const containerClasses = cn(
    "relative overflow-hidden",
    fill && "absolute inset-0",
    !fill && "w-full"
  );

  if (fill) {
    return (
      <div className={containerClasses}>
        <img
          src={src}
          alt={alt}
          className={imageClasses}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <img
        src={src}
        alt={alt}
        className={imageClasses}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
        {...props}
      />
    </div>
  );
};

/**
 * HeroImage component specifically for hero sections
 * with optimized sizing for different viewport heights
 */
export const HeroImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  ...props
}) => {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={cn(
        // Hero-specific styles
        "w-full h-full object-cover object-center",
        // Height-aware adjustments
        "h-short-hero:object-top h-short-hero:h-[100vh]",
        "landscape-compact:object-top landscape-compact:h-[100vh]",
        // Ensure minimum height on very short screens
        "min-h-[50vh] xs:min-h-[60vh] sm:min-h-[70vh]",
        className
      )}
      sizes="100vw"
      priority={true}
      {...props}
    />
  );
};

/**
 * CardImage component for cards and content areas
 * with appropriate aspect ratios
 */
export const CardImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  ...props
}) => {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={cn(
        // Card-specific styles
        "w-full h-48 xs:h-56 sm:h-64 md:h-72 object-cover",
        // Responsive aspect ratios
        "aspect-[4/3] xs:aspect-[16/10] sm:aspect-[16/9]",
        // Height adjustments for short screens
        "h-short-adjust:h-32 h-short-adjust:aspect-[4/3]",
        "landscape-adjust:h-24 landscape-adjust:aspect-[16/9]",
        className
      )}
      sizes="(max-width: 320px) 100vw, (max-width: 768px) 50vw, 33vw"
      {...props}
    />
  );
};

/**
 * AvatarImage component for profile pictures and small images
 */
export const AvatarImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  ...props
}) => {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={cn(
        // Avatar-specific styles
        "w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full object-cover",
        "flex-shrink-0",
        className
      )}
      sizes="(max-width: 320px) 32px, (max-width: 375px) 40px, 48px"
      {...props}
    />
  );
};

export default ResponsiveImage;
