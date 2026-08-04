module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        surface: { DEFAULT: '#0b0b0c', 2: '#111113', 3: '#17171a' },
        line: { DEFAULT: '#1e1e22', mid: '#2a2a30', hi: '#3a3a42' },
        accent: { DEFAULT: '#6fd6ff', deep: '#2aa8e0' },
        violet: '#9d7bff',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: { 400: '400', 500: '500', 600: '600', 700: '700' },
      animation: {
        'fade-in': 'fadeIn .8s cubic-bezier(.16,1,.3,1) both',
        'aurora': 'aurora 18s ease-in-out infinite',
        'aurora-slow': 'aurora 26s ease-in-out infinite reverse',
        'float': 'float 9s ease-in-out infinite',
        'grid-pan': 'gridPan 40s linear infinite',
        'shimmer': 'shimmer 3.5s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.6s ease-out infinite',
        'bob': 'bob 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'none' } },
        aurora: { '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' }, '33%': { transform: 'translate3d(6%,-8%,0) scale(1.15)' }, '66%': { transform: 'translate3d(-7%,5%,0) scale(.92)' } },
        float: { '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(-22px) rotate(6deg)' } },
        gridPan: { '0%': { backgroundPosition: '0 0' }, '100%': { backgroundPosition: '60px 60px' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseRing: { '0%': { transform: 'scale(.9)', opacity: .7 }, '100%': { transform: 'scale(1.7)', opacity: 0 } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(8px)' } },
      },
    },
  },
};
