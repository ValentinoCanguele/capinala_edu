/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        brand: {
          1: 'var(--gibbon-brand-1)',
          2: 'var(--gibbon-brand-2)',
          3: 'var(--gibbon-brand-3)',
          soft: 'var(--gibbon-brand-soft)',
        },
        gibbon: {
          bg: 'var(--gibbon-bg)',
          'bg-alt': 'var(--gibbon-bg-alt)',
          'bg-soft': 'var(--gibbon-bg-soft)',
          'text-1': 'var(--gibbon-text-1)',
          'text-2': 'var(--gibbon-text-2)',
          'text-3': 'var(--gibbon-text-3)',
          border: 'var(--gibbon-border)',
          warning: 'var(--gibbon-warning)',
          danger: 'var(--gibbon-danger)',
        },
        /* Supabase Studio – layout e UI (precisão visual dark/light) */
        studio: {
          bg: 'rgb(var(--studio-bg-rgb) / <alpha-value>)',
          'bg-alt': 'var(--studio-bg-alt)',
          muted: 'var(--studio-bg-muted)',
          'sidebar-bg': 'var(--studio-sidebar-bg)',
          'sidebar-text': 'var(--studio-sidebar-text)',
          'sidebar-muted': 'var(--studio-sidebar-text-muted)',
          'sidebar-hover': 'var(--studio-sidebar-hover)',
          'sidebar-active': 'var(--studio-sidebar-active)',
          border: 'var(--studio-border)',
          foreground: 'var(--studio-foreground)',
          'foreground-light': 'var(--studio-foreground-light)',
          'foreground-lighter': 'var(--studio-foreground-lighter)',
          brand: 'rgb(var(--studio-brand-rgb) / <alpha-value>)',
          'brand-hover': 'var(--studio-brand-hover)',
        },
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 15px rgba(37, 99, 235, 0.5)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        toastProgress: {
          '0%': { width: '100%' },
          '100%': { width: '0%' }
        }
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'shake': 'shake 0.4s ease-in-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'toast-progress': 'toastProgress var(--toast-duration, 4s) linear forwards',
      }
    },
  },
  plugins: [],
}
