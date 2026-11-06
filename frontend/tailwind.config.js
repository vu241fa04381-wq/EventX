/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#5146E5', // Deep Indigo primary
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        violet: {
          500: '#8B5CF6', // Violet secondary
          600: '#7C3AED',
        },
        canvas: '#F8FAFC', // Very light grey background
        surface: '#FFFFFF',
        slate: {
          900: '#111827', // Dark navy text
          500: '#64748B', // Muted text
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'premium': '0 4px 20px -2px rgba(81, 70, 229, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 0 0 1px rgba(226, 232, 240, 0.8), 0 2px 4px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 0 0 1px rgba(99, 102, 241, 0.2), 0 8px 24px -4px rgba(81, 70, 229, 0.12)',
      }
    },
  },
  plugins: [],
}

