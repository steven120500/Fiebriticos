import { FaFutbol } from "react-icons/fa";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-fiebriAzul/60 backdrop-blur-md">
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
          <h3 className="text-2xl font-black text-fiebriAzul italic uppercase tracking-tighter">
            Saltando a la cancha
          </h3>
          <p className="text-fiebriVerde font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Preparando alineaciones...
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