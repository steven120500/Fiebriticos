import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 📦 DATOS DEL CARRUSEL
const slides = [
  { id: 1, isOffer: true, title: "🔥 Ver Ofertas", eventName: "filtrarOfertas" },
  { id: 2, image: "/RetroB.png", title: "Ver Retros", eventName: "filtrarRetros" },
  { id: 3, image: "/PlayerB.png", title: "Ver Player", eventName: "filtrarPlayer" },
  { id: 4, image: "/FanB.png", title: "Ver Fan", eventName: "filtrarFan" },
  { id: 5, image: "/NacionalB.png", title: "Ver Nacional", eventName: "filtrarNacional" }
];

export default function Bienvenido() {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 segundos para que de tiempo de apreciar la chema
    return () => clearInterval(timer);
  }, []);

  const handleNavigation = () => {
    window.dispatchEvent(new CustomEvent(slides[index].eventName));
  };

  return (
    <section className="relative w-full h-[85vh] md:h-screen flex flex-col items-center justify-center overflow-hidden bg-fiebriAzul">
      
      {/* 🖼️ FONDO CON OVERLAY DE MARCA */}
      <div className="absolute inset-0 z-0">
        <img
          src={isMobile ? "/FondoM.png" : "/FondoD.png"}
          alt="Fondo Fiebriticos"
          className="w-full h-full object-cover opacity-40 grayscale-[20%]" 
        />
        {/* Degradado Azul Fiebri para fundir con el resto de la página */}
        <div className="absolute inset-0 bg-gradient-to-t from-fiebriAzul via-fiebriAzul/40 to-transparent" />
      </div>

      {/* 🔹 CONTENIDO PRINCIPAL */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-full pt-20">
        
        {/* IZQUIERDA: TEXTOS IMPACTANTES */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <span className="bg-fiebriVerde text-fiebriAzul px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">
              Temporada 2026
            </span>
            <h1 className="text-6xl md:text-9xl font-black text-white leading-none tracking-tighter">
              FIEBRE<br/>
              <span className="text-fiebriVerde">TOTAL</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-light text-gray-200 mt-4">
              a <span className="italic font-serif text-white">Fiebriticos</span>
            </h2>
            <p className="mt-6 text-gray-300 text-lg md:text-xl max-w-md font-medium border-l-4 border-fiebriVerde pl-4">
              La élite del fútbol, en tu piel. Las mejores chemas del país.
            </p>
          </motion.div>
        </div>

        {/* DERECHA: EL SHOWROOM DE CAMISETAS */}
        <div className="relative h-[350px] md:h-[550px] flex items-center justify-center mt-10 md:mt-0">
          
          <AnimatePresence mode="wait">
            {slides[index].isOffer ? (
              <motion.div 
                key="combo-ofertas"
                className="relative w-full h-full flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
              >
                <img src="/RetroB.png" className="absolute w-1/2 md:w-2/3 object-contain -translate-x-24 -rotate-12 opacity-40 blur-[2px]" />
                <img src="/FanB.png" className="absolute w-1/2 md:w-2/3 object-contain translate-x-24 rotate-12 opacity-40 blur-[2px]" />
                <img src="/NacionalB.png" className="relative w-3/4 md:w-full max-h-full object-contain z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
              </motion.div>
            ) : (
              <motion.img
                key={slides[index].id}
                src={slides[index].image}
                initial={{ opacity: 0, y: 30, rotate: 5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -30, rotate: -5 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="max-h-full max-w-full object-contain relative z-10 drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
              />
            )}
          </AnimatePresence>

          {/* 🔘 BOTÓN DE ACCIÓN (ESTILO CAJA) */}
          <div className="absolute -bottom-4 md:bottom-5 z-20">
            <AnimatePresence mode="wait">
              <motion.button
                key={slides[index].id}
                onClick={handleNavigation}
                whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(34, 197, 94, 0.5)" }}
                whileTap={{ scale: 0.9 }}
                className={`px-10 py-4 rounded-xl font-black text-xl shadow-2xl transition-all uppercase tracking-tight
                  ${slides[index].isOffer 
                    ? "bg-red-600 text-white animate-pulse" 
                    : "boton-fiebri-verde text-fiebriAzul"
                  }`}
              >
                {slides[index].title}
              </motion.button>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Indicadores de Slide */}
      <div className="absolute bottom-8 flex gap-2">
        {slides.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 transition-all duration-500 rounded-full ${i === index ? "w-8 bg-fiebriVerde" : "w-2 bg-white/20"}`} 
          />
        ))}
      </div>
    </section>
  );
}