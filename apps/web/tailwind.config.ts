import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Heilkueche — calming medical greens and blues
        primary:    { DEFAULT: '#2E7D5F', light: '#4A9E7D', dark: '#1F5C44' },
        secondary:  { DEFAULT: '#4A90A4', light: '#7AB5C6', dark: '#357384' },
        sage:       { DEFAULT: '#F5F9F7', dark: '#E0EDE7' },
        cream:      { DEFAULT: '#F5F9F7', dark: '#E0EDE7' },
        accent:     { DEFAULT: '#E8B44D', light: '#F0CC7A', dark: '#C99A33' },
        charcoal:   { DEFAULT: '#2D3436', light: '#636E72' },
        // Keep some semantic aliases for easy migration
        regency:    { DEFAULT: '#2E7D5F', light: '#E0EDE7', dark: '#1F5C44' },
        pistachio:  { DEFAULT: '#4A90A4', light: '#D4E8EF', dark: '#357384' },
        rose:       { DEFAULT: '#B2DFDB', light: '#E0F2F1', dark: '#80CBC4' },
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card:       '0 2px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 6px 24px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
