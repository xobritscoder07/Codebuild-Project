/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        page: '#eef3f5',
        nav: '#142b3a',
        card: '#fff',
        ink: '#122331',
        muted: '#61717c',
        line: '#d6e0e4',
        teal: {
          DEFAULT: '#0e9f92',
          dark: '#087267'
        },
        red: {
          DEFAULT: '#d94f5c'
        },
        amber: {
          DEFAULT: '#d88719'
        }
      },
      fontFamily: {
        sans: ['Barlow', 'Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        carter: ['Carter One', 'cursive'],
        slabo: ['Slabo 13px', 'serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        custom: '0 12px 30px rgba(20, 43, 58, 0.07)',
        hover: '0 10px 20px rgba(20, 43, 58, 0.14)',
        teal: '0 10px 20px rgba(14, 159, 146, 0.25)'
      }
    },
  },
  plugins: [],
}

