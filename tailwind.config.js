/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070d18',
          900: '#0b1424',
          800: '#111c32',
          700: '#182640',
          600: '#22334f',
        },
        gold: {
          300: '#e8ce85',
          400: '#d9b65f',
          500: '#c9a24b',
          600: '#a98233',
        },
        pearl: '#f3f0e8',
        mist: '#aeb5c2',
      },
      fontFamily: {
        display: ['Marcellus', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Figtree', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(201,162,75,0.55)' },
          '100%': { boxShadow: '0 0 0 14px rgba(201,162,75,0)' },
        },
      },
      animation: {
        rise: 'rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        'pulse-ring': 'pulseRing 1.1s ease-out 2',
      },
    },
  },
  plugins: [],
};
