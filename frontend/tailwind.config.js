/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        'bg-subtle': 'var(--color-bg-subtle)',
        'bg-raised': 'var(--color-bg-raised)',
        ink: 'var(--color-ink)',
        'ink-soft': 'var(--color-ink-soft)',
        'ink-faint': 'var(--color-ink-faint)',
        navy: 'var(--color-navy)',
        border: 'var(--color-border)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          soft: 'var(--color-primary-soft)'
        },
        teal: {
          DEFAULT: 'var(--color-teal)',
          soft: 'var(--color-teal-soft)'
        },
        critical: 'var(--color-critical)',
        'critical-soft': 'var(--color-critical-soft)',
        high: 'var(--color-high)',
        'high-soft': 'var(--color-high-soft)',
        medium: 'var(--color-medium)',
        'medium-soft': 'var(--color-medium-soft)',
        low: 'var(--color-low)',
        'low-soft': 'var(--color-low-soft)',
        resolved: 'var(--color-resolved)',
        'resolved-soft': 'var(--color-resolved-soft)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      maxWidth: {
        content: '1180px'
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 27, 42, 0.06), 0 1px 1px rgba(15, 27, 42, 0.04)',
        raised: '0 4px 16px rgba(15, 27, 42, 0.08)'
      },
      borderRadius: {
        card: '10px'
      }
    }
  },
  plugins: []
};
