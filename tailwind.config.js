module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        text: '#f0f0f0',
        surface: { DEFAULT: '#0b0b0c', 2: '#111113', 3: '#17171a' },
        line: { DEFAULT: '#1e1e22', mid: '#2a2a30', hi: '#3a3a42' },
        accent: { DEFAULT: '#6fd6ff', deep: '#2aa8e0' },
        violet: '#9d7bff',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      fontWeight: { 400: '400', 500: '500', 600: '600', 700: '700' },
      animation: {
        'fade-in': 'fadeIn .7s cubic-bezier(.2,0,0,1) both',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
    },
  },
};
