import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6EC',
        ink: '#211611',
        charcoal: '#4A3B32',
        maroon: {
          50: '#FBEDEA',
          100: '#F0CFC6',
          200: '#E0A594',
          300: '#C97457',
          400: '#A84B32',
          500: '#7A2E1E',
          600: '#5C2115',
          700: '#3F160E',
          800: '#2A0E09',
        },
        gold: {
          50: '#FBF3DE',
          100: '#F3DFA0',
          200: '#E5BE5C',
          300: '#C99A31',
          400: '#9C7620',
          500: '#6E5216',
        },
        olive: {
          600: '#3A4620',
          700: '#2B3418',
        },
        rose: {
          50: '#FBEDEA',
          100: '#F0CFC6',
          200: '#E0A594',
          300: '#C97457',
          400: '#A84B32',
          500: '#7A2E1E',
          600: '#5C2115',
          700: '#3F160E',
          800: '#2A0E09',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(43, 35, 32, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
