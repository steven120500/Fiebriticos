import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeSplash({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Duración de la intro premium: 2.2 segundos y se desvanece con elegancia
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0A1128] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Fondo con destello radial de luz de estadio */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,128,0.15)_0%,transparent_70%)] pointer-events-none" />

          {/* Contenedor principal del Logo con Anillo Brillante */}
          <div className="relative flex items-center justify-center">
            
            {/* Anillo exterior giratorio con brillo verde neón */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-[#00FF80]/50 shadow-[0_0_30px_rgba(0,255,128,0.3)]"
            />

            {/* Círculo de fondo sutil */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="w-28 h-28 sm:w-36 sm:h-36 bg-[#002244] rounded-full flex items-center justify-center shadow-2xl border-4 border-[#00FF80]/30 relative z-10 p-2"
            >
              {/* TU LOGO OFICIAL (Asegúrate de que la ruta sea correcta, o usa tu asset importado) */}
              <motion.img
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                src="/logo.png" // O pon aquí la variable de tu logo si lo importas arriba
                alt="Fiebriticos Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                onError={(e) => {
                  // Plan de respaldo por si la ruta del logo falla: muestra las iniciales estilizadas
                  e.target.style.display = 'none';
                }}
              />
            </motion.div>
          </div>

          {/* Textos institucionales elegantes */}
          <div className="text-center mt-8 z-10">
            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl sm:text-3xl font-black italic tracking-wider text-white uppercase"
            >
              FIEBRITICOS<span className="text-[#00FF80]">.CR</span>
            </motion.h1>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "80px", opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="h-[2px] bg-[#00FF80] mx-auto my-2"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400"
            >
              Saltando a la cancha...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}