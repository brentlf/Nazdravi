# Responsive Design Guide for VeeNutrition

## Overview
This guide outlines the responsive design strategy for the VeeNutrition project, ensuring optimal user experience across all device sizes from 320px to 1440px+.

## Breakpoint System

### Custom Tailwind Breakpoints
We've configured custom breakpoints in `tailwind.config.js` that align with real-world device usage, including both **width** and **height** considerations:

```javascript
screens: {
  // Width-based breakpoints (primary)
  'xs': '320px',    // Small phones (iPhone SE, older Android)
  'sm': '375px',    // iPhone X/11/12/13/14 in portrait
  'md': '414px',    // Larger phones (iPhone Plus, Pro Max)
  'lg': '768px',    // Tablets (iPad portrait)
  'xl': '1024px',   // Tablets (iPad landscape, small laptops)
  '2xl': '1280px',  // Desktops and large screens
  '3xl': '1440px',  // Large desktops
  
  // Height-based breakpoints (secondary)
  'h-xs': { 'raw': '(max-height: 568px)' },  // Short screens (iPhone SE: 568px)
  'h-sm': { 'raw': '(max-height: 667px)' },  // Medium height screens
  'h-md': { 'raw': '(max-height: 812px)' },  // Tall screens (iPhone X: 812px)
  'h-lg': { 'raw': '(min-height: 900px)' },  // Very tall screens
  
  // Combined width + height breakpoints
  'xs-h-short': { 'raw': '(max-width: 374px) and (max-height: 600px)' },
  'landscape': { 'raw': '(orientation: landscape) and (max-height: 500px)' },
  'portrait': { 'raw': '(orientation: portrait)' },
}
```

### Device Coverage

#### Width-Based Coverage
- **320px - 374px**: Small phones (iPhone SE, older Android devices)
- **375px - 413px**: Standard modern phones (iPhone X/11/12/13/14)
- **414px - 767px**: Large phones (iPhone Plus, Pro Max, Galaxy S series)
- **768px - 1023px**: Tablets in portrait mode (iPad)
- **1024px - 1279px**: Tablets in landscape, small laptops
- **1280px - 1439px**: Standard desktops
- **1440px+**: Large desktops and ultrawide monitors

#### Height-Based Coverage
- **≤ 568px**: Short screens (iPhone SE: 320×568)
- **569px - 667px**: Medium height screens (iPhone 6/7/8: 375×667)
- **668px - 812px**: Tall screens (iPhone X: 375×812)
- **≥ 900px**: Very tall screens (desktops, tablets in portrait)

#### Critical Viewport Combinations
- **320×568**: iPhone SE (smallest modern viewport)
- **375×667**: iPhone 6/7/8 (standard phone)
- **375×812**: iPhone X/11/12/13/14 (tall phone)
- **414×896**: iPhone Plus (large phone)
- **768×1024**: iPad portrait
- **1024×768**: iPad landscape
- **Landscape phones**: Height ≤ 500px (very constrained)

## Mobile-First Approach

### Design Principles
1. **Start with 320px**: Design for the smallest viewport first
2. **Progressive Enhancement**: Add features and complexity as screen size increases
3. **Fluid Layouts**: Use percentages, flexbox, and grid for flexible layouts
4. **Touch-Friendly**: Ensure minimum 44px touch targets
5. **Performance**: Optimize for mobile performance
6. **Height Awareness**: Consider both width AND height constraints
7. **Viewport Optimization**: Ensure content fits within available viewport height

### Implementation Strategy

#### 1. Container Strategy
```css
.responsive-container {
  width: 100%;
  max-width: 100vw;
  min-width: 320px;
  margin: 0 auto;
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}
```

#### 2. Typography Scaling
```css
/* Mobile-first typography with clamp() for fluid scaling */
h1 { 
  font-size: clamp(2.5rem, 5vw, 4rem); 
  line-height: 1.1; 
}

h2 { 
  font-size: clamp(2rem, 4vw, 3rem); 
  line-height: 1.2; 
}

/* Extra small screen adjustments */
@media (max-width: 374px) {
  .text-responsive-xs {
    font-size: 0.875rem !important;
    line-height: 1.4 !important;
  }
}
```

#### 3. Layout Patterns

**Mobile (320px - 767px)**:
- Single column layouts
- Stacked navigation
- Full-width components
- Touch-optimized interactions

**Tablet (768px - 1023px)**:
- Two-column layouts where appropriate
- Sidebar navigation
- Larger touch targets
- More spacing

**Desktop (1024px+)**:
- Multi-column layouts
- Hover states
- Keyboard navigation
- Maximum content width constraints

#### 4. Height-Aware Design Patterns

**Short Screens (≤ 568px height)**:
- Compact padding and margins
- Reduced font sizes
- Essential content only
- Scrollable content areas

**Landscape Phones (height ≤ 500px)**:
- Hide non-essential elements
- Compact navigation
- Horizontal layouts where possible
- Reduced vertical spacing

**Tall Screens (≥ 900px height)**:
- Full viewport utilization
- Generous spacing
- Multi-row layouts
- Enhanced visual hierarchy

## Utility Classes

### Responsive Visibility
```css
/* Hide/show on specific breakpoints */
.hide-on-xs     /* Hidden on screens ≤ 374px */
.show-on-xs     /* Visible on screens ≤ 374px */
.hide-on-mobile /* Hidden on screens ≤ 640px */
.show-on-mobile /* Visible on screens ≤ 640px */
.xs-only        /* Visible only on 320px - 413px */
.md-only        /* Visible only on 414px - 767px */
```

### Layout Utilities
```css
.min-viewport-width  /* Ensures minimum 320px width */
.prevent-overflow    /* Prevents horizontal overflow */
.mobile-edge-padding /* Safe area aware padding */
.tap-target         /* 44px minimum touch target */
.tap-target-lg      /* 48px larger touch target */
```

### Height-Aware Utilities
```css
/* Viewport height utilities */
.vh-full            /* height: 100vh */
.vh-safe            /* height: calc(100vh - safe areas) */
.min-vh-full        /* min-height: 100vh */
.min-vh-safe        /* min-height: calc(100vh - safe areas) */

/* Flexible height containers */
.flex-height        /* Flex column with min-height: 100vh */
.flex-height-safe   /* Flex column with safe area height */
.flex-1-height      /* Flex: 1 with overflow-y: auto */

/* Viewport containers */
.viewport-container     /* 100vw × 100vh, overflow hidden */
.viewport-container-safe /* Safe area aware viewport */

/* Height-responsive components */
.hero-responsive    /* Hero that adapts to viewport height */
.modal-responsive   /* Modal that fits in available height */
.nav-responsive     /* Navigation that adapts to screen height */
.footer-responsive  /* Footer that adapts to available space */
```

### Height-Based Responsive Classes
```css
/* Short screen adjustments */
.h-short-adjust     /* Reduced padding for short screens */
.h-short-hero       /* Compact hero for short screens */
.h-short-text       /* Smaller text for short screens */
.h-short-heading    /* Responsive headings for short screens */

/* Landscape phone adjustments */
.landscape-adjust   /* Minimal padding for landscape */
.landscape-hide     /* Hide elements in landscape */
.landscape-compact  /* Compact layout for landscape */
.landscape-nav      /* Compact navigation for landscape */

/* Combined width + height */
.xs-h-short-adjust  /* Extra compact for small + short */
.xs-h-short-hero    /* Minimal hero for small + short */
.xs-h-short-heading /* Tiny headings for small + short */
```

### Safe Area Support
```css
.pt-safe  /* Safe area top padding */
.pb-safe  /* Safe area bottom padding */
.pl-safe  /* Safe area left padding */
.pr-safe  /* Safe area right padding */
.px-safe  /* Safe area horizontal padding */
.py-safe  /* Safe area vertical padding */
```

## Component Guidelines

### Navigation
- **Mobile**: Hamburger menu with slide-out drawer
- **Tablet**: Collapsible sidebar or top navigation
- **Desktop**: Full horizontal navigation

### Forms
- **Mobile**: Single column, large touch targets
- **Desktop**: Multi-column where appropriate, smaller touch targets

### Cards and Content
- **Mobile**: Full width, stacked
- **Tablet**: 2-column grid
- **Desktop**: 3-4 column grid with max-width

### Images
- **All sizes**: Responsive with `max-width: 100%`
- **Mobile**: Full width or constrained to container
- **Desktop**: Constrained to content width

## Testing Strategy

### Device Testing
Test on these key viewport widths:
- 320px (iPhone SE)
- 375px (iPhone X/11/12/13/14)
- 414px (iPhone Plus/Pro Max)
- 768px (iPad portrait)
- 1024px (iPad landscape)
- 1280px (Desktop)
- 1440px (Large desktop)

### Browser Testing
- Chrome DevTools device emulation
- Firefox responsive design mode
- Safari responsive design mode
- Real device testing on iOS and Android

### Performance Testing
- Lighthouse mobile performance scores
- Core Web Vitals on mobile
- Touch interaction testing
- Network throttling tests

## Common Patterns

### Responsive Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

### Responsive Text
```jsx
<h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl">
  Responsive Heading
</h1>
```

### Responsive Spacing
```jsx
<div className="p-4 sm:p-6 md:p-8 xl:p-12">
  {/* Content with responsive padding */}
</div>
```

### Responsive Navigation
```jsx
{/* Mobile menu */}
<div className="lg:hidden">
  <MobileMenu />
</div>

{/* Desktop menu */}
<div className="hidden lg:block">
  <DesktopMenu />
</div>
```

### Height-Aware Layouts

#### Full Viewport Hero
```jsx
<section className="hero-responsive h-short-hero landscape-compact">
  <div className="flex-1-height flex items-center justify-center">
    <h1 className="h-short-heading landscape-hide">
      Your Content Here
    </h1>
  </div>
</section>
```

#### Flexible Dashboard Layout
```jsx
<div className="flex-height-safe">
  <header className="nav-responsive">
    {/* Navigation content */}
  </header>
  
  <main className="flex-1-height overflow-y-auto">
    {/* Main content that scrolls */}
  </main>
  
  <footer className="footer-responsive">
    {/* Footer content */}
  </footer>
</div>
```

#### Modal with Height Constraints
```jsx
<div className="modal-responsive max-h-90vh landscape:max-h-95vh">
  {/* Modal content that fits in viewport */}
</div>
```

#### Responsive Typography with Height Awareness
```jsx
<h1 className="text-4xl sm:text-5xl md:text-6xl h-short-heading landscape-hide">
  Main Heading
</h1>

<p className="text-lg sm:text-xl h-short-text landscape-adjust">
  Description text that adapts to screen height
</p>
```

## Best Practices

### 1. Content Strategy
- Prioritize content for mobile users
- Use progressive disclosure for complex features
- Ensure critical actions are easily accessible

### 2. Performance
- Optimize images for different screen densities
- Use appropriate image formats (WebP, AVIF)
- Implement lazy loading for below-the-fold content

### 3. Accessibility
- Maintain proper heading hierarchy
- Ensure sufficient color contrast
- Provide alternative text for images
- Test with screen readers

### 4. Touch Interactions
- Minimum 44px touch targets
- Adequate spacing between interactive elements
- Clear visual feedback for touch states

### 5. Loading States
- Show loading indicators for async operations
- Implement skeleton screens for better perceived performance
- Graceful degradation for slow connections

### 6. Height-Aware Design
- **Test on short screens**: Always test on iPhone SE (320×568) and landscape phones
- **Use viewport units wisely**: Prefer `vh` for full-height sections, but provide fallbacks
- **Implement flexible layouts**: Use flexbox/grid for content that adapts to available height
- **Consider landscape orientation**: Design for phones rotated to landscape mode
- **Progressive enhancement**: Start with basic layout, enhance for taller screens
- **Content prioritization**: Hide non-essential elements on short screens
- **Scrollable areas**: Ensure content can scroll when it exceeds viewport height

### 7. Viewport Optimization
- **Above-the-fold content**: Ensure critical content fits in first viewport
- **Hero sections**: Use `min-height: 100vh` but provide compact alternatives
- **Modals and overlays**: Constrain to 90% of viewport height with scrolling
- **Navigation**: Adapt height based on available screen space
- **Forms**: Consider multi-step forms on short screens

## Implementation Checklist

### Width-Based Responsive Design
- [ ] Set up custom breakpoints in Tailwind config
- [ ] Implement mobile-first CSS architecture
- [ ] Add responsive utility classes
- [ ] Test on all target viewport sizes
- [ ] Optimize images for different screen densities
- [ ] Implement touch-friendly interactions
- [ ] Add safe area support for modern devices
- [ ] Test performance on mobile devices
- [ ] Validate accessibility compliance
- [ ] Cross-browser testing

### Height-Aware Design
- [ ] Add height-based breakpoints (`h-xs`, `h-sm`, `h-md`, `h-lg`)
- [ ] Implement viewport height utilities (`.vh-full`, `.vh-safe`)
- [ ] Create flexible height containers (`.flex-height`, `.flex-1-height`)
- [ ] Add height-responsive component classes
- [ ] Test on short screens (iPhone SE: 320×568)
- [ ] Test landscape orientation on phones
- [ ] Implement compact layouts for constrained heights
- [ ] Add height-aware typography scaling
- [ ] Test modal and overlay height constraints
- [ ] Validate full-viewport layouts work on all devices

### Critical Viewport Testing
- [ ] iPhone SE (320×568) - smallest modern viewport
- [ ] iPhone 6/7/8 (375×667) - standard phone
- [ ] iPhone X/11/12/13/14 (375×812) - tall phone
- [ ] iPhone Plus (414×896) - large phone
- [ ] iPad portrait (768×1024) - tablet
- [ ] iPad landscape (1024×768) - tablet landscape
- [ ] Phone landscape (height ≤ 500px) - constrained height
- [ ] Desktop (1280×720+) - standard desktop
- [ ] Large desktop (1440×900+) - large screens

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev Responsive Design](https://web.dev/responsive-web-design-basics/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

This guide should be updated as the project evolves and new responsive patterns are established.
