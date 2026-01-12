/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Granola-style palette
        background: '#FAFAFA',
        card: 'rgba(255, 255, 255, 0.8)',

        // Textos
        primary: '#0A0A0A',
        secondary: '#525252',
        muted: '#A3A3A3',

        // Acentos
        accent: {
          green: '#22C55E',
          yellow: '#FDE047',
          orange: '#FB923C',
          blue: '#3B82F6',
          purple: '#A855F7',
        },

        // Financieros
        income: '#22C55E',
        expense: '#EF4444',

        // Bordes
        border: '#E5E5E5',

        // Granola gradients (for reference)
        'grad-yellow': 'hsla(60, 100%, 50%, 0.15)',
        'grad-green': 'hsla(142, 76%, 36%, 0.12)',
        'grad-orange': 'hsla(30, 100%, 50%, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'title': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'elevated': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 40px rgba(34, 197, 94, 0.15)',
        'glow-expense': '0 0 40px rgba(239, 68, 68, 0.15)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        fadeInUp: 'fadeInUp 0.5s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        shimmer: 'shimmer 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
      backgroundImage: {
        'gradient-balance': 'linear-gradient(135deg, #0A0A0A 0%, #3F3F46 100%)',
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'gradient-radial-top': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, hsla(60, 100%, 50%, 0.2), transparent), radial-gradient(ellipse 60% 40% at 80% 60%, hsla(142, 76%, 36%, 0.15), transparent)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '75': '75ms',
      },
    },
  },
  plugins: [],
}
