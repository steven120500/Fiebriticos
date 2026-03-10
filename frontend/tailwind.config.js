/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        // Colores oficiales de Fiebriticos (Basados en tu caja)
        fiebriVerde: "#22C55E",    // Verde gramilla vibrante para botones de acción
        fiebriAzul: "#1E40AF",     // Azul profundo del logo para Navbars y títulos
        fiebriCeleste: "#3B82F6",  // Azul claro para acentos y bordes
        fiebriNegro: "#111827",    // Para textos legibles
        fiebriGris: "#F3F4F6",     // Para fondos limpios
      },
    },
  },
  // Actualizamos el safelist para que Tailwind no borre tus nuevos colores
  safelist: [
    "text-fiebriVerde",
    "bg-fiebriVerde",
    "text-fiebriAzul",
    "bg-fiebriAzul",
    "border-fiebriVerde",
    "border-fiebriAzul",
  ],
  plugins: [
    require("tailwind-scrollbar"),
  ],
};