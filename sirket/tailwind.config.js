/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{html,js,ejs}",
    "./views/pages/**/*.{html,js,ejs}",
    "./views/pages/auth/**/*.{html,js,ejs}",
    "./views/partials/**/*.{html,js,ejs}",
    "./views/layouts/**/*.{html,js,ejs}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#55828b',
        secondary: '#c9e4ca',
        fafa: '#FAFAFA',
        f5f5: '#F5F5F5',
        menu: '#2E3033'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sfprotext : ['SF Pro Text', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        marquee2: 'marquee2 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
  },
  plugins: [require('flowbite/plugin')],
}