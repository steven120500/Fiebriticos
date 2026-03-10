import { useState, useEffect } from "react";

export default function CarruselFondo({ imagenes = [], intervalo = 8000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!imagenes.length) return;
    const cambio = setInterval(() => {
      setIndex((prev) => (prev + 1) % imagenes.length);
    }, intervalo);
    return () => clearInterval(cambio);
  }, [imagenes, intervalo]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-fiebriAzul">
      {/* 🖼️ Imágenes con efecto "Ken Burns" (zoom lento cinemático) */}
      {imagenes.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-[3000ms] ease-in-out ${
            i === index ? "opacity-40 scale-110 z-10" : "opacity-0 scale-100 z-0"
          }`}
          style={{
            backgroundImage: `url(${img})`,
            // El zoom dura más que la transición de opacidad para un efecto más suave
            transition: "opacity 3s ease-in-out, transform 12s linear",
          }}
        />
      ))}

      {/* 🔸 Overlay con degradado Azul Fiebriticos (Filtro Pro) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-fiebriAzul/60 via-fiebriAzul/40 to-fiebriAzul"></div>

      {/* ⚪ Indicadores (Estilo Fiebriticos) */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
        {imagenes.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-700 ${
              i === index
                ? "w-10 bg-fiebriVerde shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                : "w-2 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Ir a imagen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}