import { motion } from "framer-motion";
import { FaGlobeAmericas, FaArrowRight } from "react-icons/fa";

export default function MundialBanner({ onMundialClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 0 }}
      animate={{ 
        opacity: 1, 
        y: [0, -8, 0], // Flote constante
        
        // ✨ EL BRILLO PROGRAMADO ✨
        // 1. Apagado -> 2. Brilla -> 3. Se apaga -> 4. Se mantiene apagado 5 segundos
        boxShadow: [
          "0px 0px 0px 0px rgba(0, 135, 81, 0)",       
          "0px 0px 35px 12px rgba(0, 135, 81, 0.6)",   
          "0px 0px 0px 0px rgba(0, 135, 81, 0)",       
          "0px 0px 0px 0px rgba(0, 135, 81, 0)"        
        ]
      }}
      transition={{
        opacity: { duration: 0.5 },
        y: {
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut"
        },
        // ⏱️ LA LÍNEA DE TIEMPO EXACTA (6.5s en total)
        boxShadow: {
          duration: 6.5, 
          repeat: Infinity, 
          ease: "easeInOut",
          times: [0, 0.11, 0.23, 1] // 0s(Inicio) -> 0.75s(Pico) -> 1.5s(Apaga) -> 6.5s(Espera)
        }
      }}
      whileHover={{ scale: 1.03 }} 
      whileTap={{ scale: 0.98 }}
      onClick={onMundialClick}
      className="relative w-full overflow-hidden rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer mb-6 border-2 border-gray-100 bg-white group z-10"
    >
      {/* 🌊 ONDAS TRIONDA */}
      <div 
        className="absolute top-0 right-0 w-[150%] h-[150%] sm:w-full sm:h-full opacity-80 sm:opacity-90 transition-transform duration-700 group-hover:scale-110 origin-top-right" 
        style={{
          background: "linear-gradient(105deg, transparent 45%, rgba(26, 74, 155, 0.95) 55%, rgba(0, 135, 81, 0.95) 75%, rgba(225, 28, 36, 0.95) 95%)"
        }}
      />
      
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,_black_1.5px,_transparent_1.5px)] bg-[length:12px_12px]" />

      {/* ✨ RAYO DE LUZ CON LÍNEA DE TIEMPO EXACTA ✨ */}
      <motion.div 
        animate={{ x: ["-200%", "300%", "300%"] }} // Cruza rápido y se queda quieto afuera
        transition={{ 
          duration: 6.5, // Mismo tiempo total
          repeat: Infinity, 
          ease: "easeInOut", 
          times: [0, 0.23, 1] // Cruza en el primer 23% (1.5s) y espera el resto (5s)
        }}
        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 z-20 pointer-events-none"
      />

      <div className="relative p-6 sm:p-8 flex items-center justify-between z-10 h-full">
        
        <div className="flex flex-col w-full relative">
          <div className="flex items-center gap-2 mb-1 bg-white/30 w-max px-2 py-0.5 rounded-full backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none">
            <FaGlobeAmericas className="animate-spin-slow text-base sm:text-xl text-fiebriAzul" />
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-gray-700 sm:text-gray-500">
              Rumbo al 2026
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-none mt-2">
            <span className="text-black drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)]">ZONA</span> <br className="sm:hidden" />
            <span className="text-black drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)]">
              MUNDIALISTA
            </span>
          </h2>
          
          <p className="text-[10px] sm:text-xs font-bold mt-2 text-gray-100 max-w-[90%] sm:max-w-[70%] leading-tight uppercase tracking-widest hidden sm:block drop-shadow-md">
            Tres naciones, un ícono. Equípate con las selecciones. ¡Que empiece la fiesta!
          </p>

          <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-fiebriAzul bg-white/95 shadow-lg w-max px-5 py-2.5 rounded-xl backdrop-blur-sm sm:hidden z-30 active:scale-95 transition-transform">
             Ver Chemas <FaArrowRight />
          </div>
        </div>

      </div>
    </motion.div>
  );
}