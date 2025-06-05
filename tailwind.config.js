/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    fontFamily: {
      sans: ['Outfit', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    },
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        primary: '#EAB308',         // Amber-500 (Original Accent)
        'primary-dark': '#D97706',  // Amber-600 (Slightly more golden dark)
        'primary-light': '#FEF3C7', // Amber-100 (More subtle light)
        
        'jet-black': '#000000',       // Pure black for highest contrast
        'charcoal': '#1A1A1A',        // Softer dark for backgrounds
        'white': '#FFFFFF',           // Explicit white

        // Neutral Gray Palette
        'neutral-50':  '#F9FAFB', 
        'neutral-100': '#F3F4F6', 
        'neutral-200': '#E5E7EB', 
        'neutral-300': '#D1D5DB', 
        'neutral-400': '#9CA3AF', 
        'neutral-500': '#6B7280', 
        'neutral-600': '#4B5563', 
        'neutral-700': '#374151', 
        'neutral-800': '#1F2937', 
        'neutral-900': '#111827', 
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' }, // Ensure final translateY is 0
        },
      },
      transitionTimingFunction: {
        'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth and common easing
      },
      transitionDuration: {
        'DEFAULT': '200ms', // Default for most transitions
        'fast': '100ms',
        'normal': '200ms',
        'slow': '300ms',
        'slower': '400ms',
        'slowest': '500ms',
      },
    },
  },
  plugins: [],
}
