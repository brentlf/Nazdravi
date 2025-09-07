/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
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
      'xs-h-short': { 'raw': '(max-width: 374px) and (max-height: 600px)' },  // Small + short
      'landscape': { 'raw': '(orientation: landscape) and (max-height: 500px)' },  // Landscape phones
      'portrait': { 'raw': '(orientation: portrait)' },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        link: {
          DEFAULT: "hsl(var(--link))",
          foreground: "hsl(var(--link-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Warm neutral color palette for light theme
        warm: {
          50: "hsl(var(--warm-50))",
          100: "hsl(var(--warm-100))",
          200: "hsl(var(--warm-200))",
          300: "hsl(var(--warm-300))",
          400: "hsl(var(--warm-400))",
          500: "hsl(var(--warm-500))",
          600: "hsl(var(--warm-600))",
          700: "hsl(var(--warm-700))",
          800: "hsl(var(--warm-800))",
          900: "hsl(var(--warm-900))",
        },
        // Dark theme color palette
        dark: {
          50: "hsl(var(--dark-50))",
          100: "hsl(var(--dark-100))",
          200: "hsl(var(--dark-200))",
          300: "hsl(var(--dark-300))",
          400: "hsl(var(--dark-400))",
          500: "hsl(var(--dark-500))",
          600: "hsl(var(--dark-600))",
          700: "hsl(var(--dark-700))",
          800: "hsl(var(--dark-800))",
          900: "hsl(var(--dark-900))",
        },
      },
      animation: {
        "theme-transition": "theme-transition 0.3s ease-in-out",
      },
      keyframes: {
        "theme-transition": {
          "0%": { opacity: "0.8" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
}
