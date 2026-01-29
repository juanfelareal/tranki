/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium emerald/mint palette
        background: '#F0FDF4',
        card: 'rgba(255, 255, 255, 0.85)',

        // Textos
        primary: '#0F172A',
        secondary: '#475569',
        muted: '#94A3B8',

        // Accent system - Emerald
        accent: {
          emerald: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
            800: '#065F46',
            900: '#064E3B',
          },
          mint: '#F0FDF4',
          teal: '#14B8A6',
          gold: '#F59E0B',
          coral: '#F97316',
        },

        // Financieros
        income: '#10B981',
        expense: '#F97316',

        // Bordes
        border: '#E8F5F0',

        // Pro/Gold
        'pro-gold': '#F59E0B',
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
        'soft': '0 2px 8px rgba(5, 150, 105, 0.06)',
        'card': '0 1px 3px rgba(5, 150, 105, 0.08), 0 1px 2px rgba(5, 150, 105, 0.04)',
        'elevated': '0 4px 20px rgba(5, 150, 105, 0.10)',
        'premium': '0 8px 30px rgba(5, 150, 105, 0.12)',
        'glow': '0 0 40px rgba(16, 185, 129, 0.20)',
        'glow-emerald': '0 0 60px rgba(16, 185, 129, 0.25)',
        'glow-expense': '0 0 40px rgba(249, 115, 22, 0.15)',
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
        'gradient-emerald': 'linear-gradient(135deg, #047857 0%, #059669 40%, #10B981 100%)',
        'gradient-balance': 'linear-gradient(135deg, #047857 0%, #10B981 100%)',
        'gradient-balance-premium': 'linear-gradient(135deg, #047857 0%, #059669 50%, #10B981 100%)',
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'gradient-radial-top': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(5, 150, 105, 0.12), transparent)',
        'gradient-hero-premium': 'linear-gradient(135deg, #047857 0%, #059669 30%, #10B981 60%, #34D399 100%)',
        'gradient-mint-soft': 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #F0FDF4 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
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
