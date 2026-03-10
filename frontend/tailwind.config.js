/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fiebriVerde: "#22C55E",
        fiebriAzul: "#1E40AF",
        fiebriGris: "#F3F4F6",
      },
    },
  },
  plugins: [],
}