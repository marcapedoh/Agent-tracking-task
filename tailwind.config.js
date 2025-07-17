/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      animation: {
        'ping-scale': 'ping-scale 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'ping-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        }
      }
    },
  },
  plugins: [],
}

