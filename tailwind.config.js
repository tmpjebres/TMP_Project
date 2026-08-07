/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          primary: '#1C3F3A',
          secondary: '#2A5F58',
          accent: '#3D7A73',
          light: '#E8F0EF',
        },
        brass: {
          DEFAULT: '#B08D57',
          dark: '#8C6D3F',
          light: '#F3ECDD',
        },
        neutral: {
          white: '#FFFFFF',
          black: '#111111',
          gray: '#666666',
          'light-gray': '#EEEEEE',
          'border-gray': '#DDDDDD',
        },
        status: {
          success: '#28A745',
          warning: '#FFC107',
          danger: '#DC3545',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          sunken: 'var(--surface-sunken)',
        },
        canvas: 'var(--canvas)',
        'border-subtle': 'var(--border-subtle)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        dark: {
          canvas: '#0F1512',
          surface: '#161E1B',
          'surface-hover': '#1D2724',
          'surface-sunken': '#0C1210',
          border: '#28332F',
          'text-primary': '#EBEFED',
          'text-secondary': '#9FADA8',
          'text-muted': '#71827C',
          'brand-primary': '#5FA69C',
          'brand-secondary': '#4A9089',
          'brand-accent': '#7BC4B8',
          'brand-light': 'rgba(95,166,156,0.12)',
          brass: '#D4B27E',
          'brass-light': 'rgba(212,178,126,0.12)',
          success: '#4ADE80',
          warning: '#FBBF24',
          danger: '#F87171',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(28, 63, 58, 0.08)',
        'card-hover': '0 12px 40px rgba(28, 63, 58, 0.15)',
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.35)',
        'card-hover-dark': '0 14px 40px rgba(0, 0, 0, 0.5)',
        'glow-dark': '0 8px 28px -6px rgba(95, 166, 156, 0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Headline words resolving in on load.
        'word-in': {
          '0%': { opacity: '0', transform: 'translateY(0.4em)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        // Slow ambient drift for the color fields behind the glass inputs.
        drift: {
          '0%, 100%': { transform: 'translate(-6%, -4%) scale(1)' },
          '50%': { transform: 'translate(4%, 6%) scale(1.08)' },
        },
        // Gentle Ken Burns zoom-out for the hero image on load.
        kenburns: {
          '0%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        // Validation-failure shake.
        shake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-4px)' },
          '40%, 60%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'word-in': 'word-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        drift: 'drift 14s ease-in-out infinite',
        kenburns: 'kenburns 6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        shake: 'shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
      },
    },
  },
  plugins: [],
};