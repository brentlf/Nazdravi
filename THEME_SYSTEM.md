# 🎨 Enhanced Theme System

## Overview

The VeeNutrition application now features a completely reworked theme system with:

- **Light Theme**: Warm neutral colors for comfort and readability
- **Dark Theme**: Sophisticated dark colors with excellent contrast
- **System Theme**: Automatic detection and smooth transitions
- **Enhanced Transitions**: Smooth animations between theme changes

## 🎯 Key Features

### 1. Warm Neutral Light Theme
- **Background**: Warm off-white (35 20% 98%)
- **Text**: Warm dark brown (25 15% 15%)
- **Cards**: Subtle warm white (35 20% 99%)
- **Borders**: Warm light gray (35 15% 88%)

### 2. Sophisticated Dark Theme
- **Background**: Deep blue-tinted charcoal (220 15% 8%)
- **Text**: Soft white (0 0% 95%)
- **Cards**: Rich dark charcoal (220 15% 12%)
- **Borders**: Deep gray (220 10% 22%)

### 3. System Theme Detection
- Automatically detects OS preference
- Real-time updates when system theme changes
- Smooth transitions between light/dark modes

## 🎨 Color Palettes

### Warm Colors (Light Theme)
```css
--warm-50: 35 20% 98%   /* Warmest background */
--warm-100: 35 15% 94%  /* Warm light */
--warm-200: 35 15% 88%  /* Warm lighter */
--warm-300: 35 10% 78%  /* Warm medium */
--warm-400: 25 10% 65%  /* Warm medium-dark */
--warm-500: 25 15% 45%  /* Warm dark */
--warm-600: 25 15% 35%  /* Warm darker */
--warm-700: 25 15% 25%  /* Warm darkest */
--warm-800: 25 15% 18%  /* Warm charcoal */
--warm-900: 25 15% 12%  /* Warm black */
```

### Dark Colors
```css
--dark-50: 220 15% 8%   /* Darkest background */
--dark-100: 220 10% 12% /* Darker */
--dark-200: 220 10% 18% /* Dark */
--dark-300: 220 10% 25% /* Medium dark */
--dark-400: 220 10% 35% /* Medium */
--dark-500: 220 10% 50% /* Medium light */
--dark-600: 220 10% 65% /* Light */
--dark-700: 220 10% 80% /* Lighter */
--dark-800: 220 10% 90% /* Lightest */
--dark-900: 0 0% 95%    /* Pure white */
```

## 🚀 Usage

### Theme Context Hook
```tsx
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { 
    theme,           // "light" | "dark" | "system"
    setTheme,        // Function to change theme
    actualTheme,     // "light" | "dark" (resolved theme)
    isSystemTheme,   // boolean
    systemPreference // "light" | "dark"
  } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Actual theme: {actualTheme}</p>
      <button onClick={() => setTheme("dark")}>
        Switch to Dark
      </button>
    </div>
  );
}
```

### Theme Toggle Component
```tsx
import { ThemeToggle } from "@/components/common/ThemeToggle";

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

## 🎨 Utility Classes

### Theme-Aware Utilities
```css
.theme-aware-bg      /* Uses --background color */
.theme-aware-text    /* Uses --foreground color */
.theme-aware-border  /* Uses --border color */
.theme-aware-card    /* Uses --card and --card-foreground */
```

### Warm Theme Utilities
```css
.bg-warm-subtle      /* Warm background */
.bg-warm-gradient    /* Warm gradient */
.text-warm-primary   /* Warm text */
.border-warm-subtle  /* Warm border */
```

### Dark Theme Utilities
```css
.bg-dark-subtle      /* Dark background */
.bg-dark-gradient    /* Dark gradient */
.text-dark-primary   /* Dark text */
.border-dark-subtle  /* Dark border */
```

### Enhanced Effects
```css
.hover-lift          /* Subtle lift on hover */
.glass-effect        /* Light theme glass effect */
.glass-effect-dark   /* Dark theme glass effect */
.shadow-soft         /* Soft shadow */
.shadow-elegant      /* Elegant shadow */
.shadow-dark         /* Dark theme shadow */
.shadow-elegant-dark /* Dark theme elegant shadow */
```

## 🔧 Implementation Details

### CSS Custom Properties
The theme system uses CSS custom properties (CSS variables) for dynamic theming:

```css
:root {
  /* Light theme colors */
  --background: 35 20% 98%;
  --foreground: 25 15% 15%;
  /* ... more colors */
}

.dark {
  /* Dark theme colors */
  --background: 220 15% 8%;
  --foreground: 0 0% 95%;
  /* ... more colors */
}
```

### Tailwind Integration
Colors are available in Tailwind classes:

```tsx
// Warm colors
<div className="bg-warm-100 text-warm-700 border-warm-200" />

// Dark colors  
<div className="bg-dark-100 text-dark-800 border-dark-200" />

// Theme-aware colors
<div className="bg-background text-foreground border-border" />
```

### Smooth Transitions
All theme changes include smooth transitions:

```css
.theme-transitioning {
  transition: background-color 0.3s ease, 
              color 0.3s ease, 
              border-color 0.3s ease, 
              box-shadow 0.3s ease;
}
```

## 🎯 Best Practices

### 1. Use Theme-Aware Colors
```tsx
// ✅ Good - Theme-aware
<div className="bg-background text-foreground border-border" />

// ❌ Avoid - Hard-coded colors
<div className="bg-white text-black border-gray-300" />
```

### 2. Leverage Utility Classes
```tsx
// ✅ Good - Use utility classes
<div className="theme-aware-card hover-lift" />

// ❌ Avoid - Custom CSS
<div className="bg-card text-card-foreground" style={{transition: 'all 0.3s'}} />
```

### 3. Test Both Themes
Always test your components in both light and dark themes to ensure:
- Proper contrast ratios
- Readable text
- Consistent visual hierarchy
- Smooth transitions

## 🔄 Migration Guide

### From Old Theme System
1. Replace hard-coded colors with theme-aware utilities
2. Use the new color palette variables
3. Implement smooth transitions
4. Test in all three theme modes

### Example Migration
```tsx
// Old
<div className="bg-white text-gray-800 border-gray-200" />

// New
<div className="theme-aware-card border-border" />
```

## 🧪 Testing

### Theme Demo Component
Use the `ThemeDemo` component to test the theme system:

```tsx
import { ThemeDemo } from "@/components/ui/ThemeDemo";

function TestPage() {
  return (
    <div>
      <h1>Theme Testing</h1>
      <ThemeDemo />
    </div>
  );
}
```

### Manual Testing
1. Switch between light, dark, and system themes
2. Verify smooth transitions
3. Check contrast ratios
4. Test system theme detection
5. Validate color consistency

## 🎨 Customization

### Adding New Colors
To add new theme colors:

1. Add CSS custom properties in `index.css`
2. Update Tailwind config in `tailwind.config.ts`
3. Create utility classes if needed

### Example
```css
/* In index.css */
:root {
  --custom-color: 200 50% 50%;
}

.dark {
  --custom-color: 200 50% 30%;
}
```

```ts
// In tailwind.config.ts
colors: {
  custom: "hsl(var(--custom-color))",
}
```

## 🚀 Performance

### Optimizations
- CSS custom properties for dynamic theming
- Minimal JavaScript for theme switching
- Efficient CSS transitions
- No unnecessary re-renders

### Bundle Size
- No additional dependencies
- Lightweight theme context
- Efficient CSS architecture

## 🔮 Future Enhancements

### Planned Features
- High contrast mode
- Custom color schemes
- Theme presets
- Accessibility improvements
- Animation customization

### Contributing
To contribute to the theme system:
1. Follow the established color palette
2. Maintain accessibility standards
3. Test in all theme modes
4. Document new features

---

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Theme Switching Best Practices](https://web.dev/prefers-color-scheme/)

---

*Last updated: December 2024*
