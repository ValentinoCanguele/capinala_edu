/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
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
          bg: 'var(--studio-bg)',
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
          brand: 'var(--studio-brand)',
          'brand-hover': 'var(--studio-brand-hover)',
        },
      },
    },
  },
  plugins: [],
}
