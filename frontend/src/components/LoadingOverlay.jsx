import React, { useEffect, useState } from "react";
import { FaFutbol } from "react-icons/fa";

export default function LoadingOverlay() {
  const [showWelcome, setShowWelcome] = useState(true);

  // Sincronizamos el tiempo para que el LoadingOverlay espere a que termine el WelcomeSplash (2.2 segundos)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // 🚀 JUGADA CLAVE: Si el splash inicial sigue activo, no mostramos este loader para que no choquen
  if (showWelcome) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-fiebriAzul/60 backdrop-blur-md">
      <div className="text-center bg-white p-10 rounded-[2.5rem] shadow-2xl border-b-8 border-fiebriVerde flex flex-col items-center">
        
        {/* Balón Girando - El Spinner de Fiebriticos */}
        <div className="relative mb-6">
          <FaFutbol 
            className="text-fiebriAzul text-6xl animate-spin" 
            style={{ animationDuration: '2s' }} 
          />
          {/* Sombra del balón para efecto 3D */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/10 rounded-full blur-md" />
        </div>

        <div className="space-y-2">
          <p className="text-fiebriVerde font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Cargando...
          </p>
        </div>

        {/* Barra de progreso decorativa */}
        <div className="mt-8 w-40 h-1.5 bg-fiebriGris rounded-full overflow-hidden">
          <div className="h-full bg-fiebriVerde animate-[shimmer_1.5s_infinite] w-1/2 rounded-full" />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}