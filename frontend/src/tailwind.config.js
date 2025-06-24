const { transform } = require('typescript');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/js/views/*.html", "./index.html"],
  theme: {
    extend: {
      animation: {
        rainbow: "rainbow 20s infinite",
        scrollLeft: "scrollLeft 20s linear infinite",
      },
      keyframes: {
        rainbow: {
          '0%':   { borderColor: 'red', boxShadow: '0 0 20px red' },
          '10%':  { borderColor: 'orange', boxShadow: '0 0 20px orange' },
          '20%':  { borderColor: 'yellow', boxShadow: '0 0 20px yellow' },
          '30%':  { borderColor: 'lime', boxShadow: '0 0 20px lime' },
          '40%':  { borderColor: 'green', boxShadow: '0 0 20px green' },
          '50%':  { borderColor: 'cyan', boxShadow: '0 0 20px cyan' },
          '60%':  { borderColor: 'blue', boxShadow: '0 0 20px blue' },
          '70%':  { borderColor: 'indigo', boxShadow: '0 0 20px indigo' },
          '80%':  { borderColor: 'violet', boxShadow: '0 0 20px violet' },
          '90%':  { borderColor: 'pink', boxShadow: '0 0 20px pink' },
          '100%': { borderColor: 'red', boxShadow: '0 0 20px red' },
        },
        scrollLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      fontFamily: {
        comic: ['Comic', 'sans-serif'],
      },
      backgroundImage: {
        'stars': "url('../assets/backgrounds/movingStars.gif')",
      }
    },
    backgroundSize: {
      '20%': '20%',
    }
  },
  plugins: [],
}
