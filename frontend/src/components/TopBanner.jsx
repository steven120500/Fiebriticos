import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function TopBanner() {
  const messages = [
    "STOCK DE +2500 JOYAS DISPONIBLES",
    "ENVÍOS EXPRESS A TODO EL PAÍS",
    "SOMOS FIEBRITICOS CR",
    "TU ESTILO JUEGA EN PRIMERA",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div
      className="fixed top-0 left-0 w-full z-[60] bg-fiebriVerde border-white/10 h-8 flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-fiebriAzul italic"
        >
          {messages[currentIndex]}
        </motion.p>
      </AnimatePresence>

      {/* Brillo sutil decorativo que recorre el banner */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite]" />
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export default TopBanner;