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
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(28, 63, 58, 0.08)',
        'card-hover': '0 12px 40px rgba(28, 63, 58, 0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
