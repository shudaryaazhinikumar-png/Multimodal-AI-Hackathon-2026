/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FBF9F4',
          100: '#F5F2EA',
          200: '#EDE8DB',
          300: '#E0D9C8',
        },
        clay: {
          50: '#FFFDF7',
          100: '#FAF6EE',
          200: '#F0EBE0',
          300: '#E5DECF',
          400: '#D4CAB4',
          500: '#B8AB8E',
          600: '#9A8E72',
          700: '#7A6F56',
          800: '#5A513E',
          900: '#3D372A',
        },
        violet: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        lavender: {
          100: '#E6E1F7',
          200: '#D4CCF0',
          300: '#B8AADF',
          400: '#9B87CC',
          500: '#7E64B8',
        },
        mint: {
          100: '#E0F2ED',
          200: '#C2E5D9',
          300: '#9DD3BE',
          400: '#7AC3A3',
          500: '#5AAB86',
        },
        peach: {
          100: '#FDE8DD',
          200: '#FAD0BC',
          300: '#F5B197',
          400: '#EE9576',
          500: '#E2795C',
        },
        warmyellow: {
          100: '#FDF4DC',
          200: '#FBE9B8',
          300: '#F7D98C',
          400: '#F0C75E',
          500: '#E0B23E',
        },
        charcoal: {
          700: '#3F3A33',
          800: '#2D2925',
          900: '#1E1B18',
        },
        success: {
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        clay: '1.5rem',
        'clay-lg': '2rem',
        'clay-xl': '2.5rem',
        'clay-2xl': '3rem',
      },
      boxShadow: {
        clay: '0 4px 12px -2px rgba(60, 50, 40, 0.08), 0 2px 6px -1px rgba(60, 50, 40, 0.06), inset 0 1px 2px rgba(255,255,255,0.7)',
        'clay-sm': '0 2px 8px -2px rgba(60, 50, 40, 0.08), inset 0 1px 1px rgba(255,255,255,0.6)',
        'clay-lg': '0 8px 24px -4px rgba(60, 50, 40, 0.1), 0 4px 10px -2px rgba(60, 50, 40, 0.08), inset 0 1px 3px rgba(255,255,255,0.8)',
        'clay-xl': '0 16px 40px -8px rgba(60, 50, 40, 0.12), 0 8px 20px -4px rgba(60, 50, 40, 0.08), inset 0 1px 3px rgba(255,255,255,0.8)',
        'clay-pressed': 'inset 0 2px 6px rgba(60, 50, 40, 0.12), inset 0 -1px 1px rgba(255,255,255,0.4)',
        'clay-raised': '0 6px 16px -3px rgba(124, 58, 237, 0.2), 0 3px 8px -2px rgba(124, 58, 237, 0.15), inset 0 1px 2px rgba(255,255,255,0.6)',
        'clay-hover': '0 10px 30px -6px rgba(60, 50, 40, 0.12), 0 6px 14px -3px rgba(60, 50, 40, 0.08), inset 0 1px 3px rgba(255,255,255,0.8)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
