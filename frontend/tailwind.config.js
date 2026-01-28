/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#1f2937', // Custom between 800 and 900 for panels
          950: '#020617', // Deep night
        },
        // Study Comfort Palette
        sand: {
          50: '#fdfbf7',
          100: '#f7f3f0', // Text Primary
          200: '#e3d5c5', // Warm Accent
          300: '#dcd6d0', // Text Secondary
        },
        sage: {
          400: '#34d399',
          500: '#10b981', // Success
        },
        lavender: {
          400: '#818cf8',
          500: '#6366f1', // Focus/Active
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
