import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFutbol, FaFilter } from "react-icons/fa";

export default function Bienvenido() {
  const [activeIndex, setActiveIndex] = useState(0);

  // 🔹 Nuestras 3 joyas estrella (Las imágenes se leen directo de la carpeta public)
  const chemas = [
    { id: "Player", name: "Versión Player", img: "/PlayerB.png", desc: "Ajuste Profesional" },
    { id: "Fan", name: "Versión Fan", img: "/FanB.png", desc: "Máximo Confort" },
    { id: "Retro", name: "Retro", img: "/RetroB.png", desc: "Clásicos Eternos" },
  ];

  // ⏱️ Efecto de "brinco" automático cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % chemas.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [chemas.length]);

  // 🎯 Coreografía de entrada del texto
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const handleFiltrar = (tipo) => {
    // Aquí disparamos el evento para que la app sepa qué filtrar y bajamos el scroll
    window.dispatchEvent(new Event(`filtrar${tipo}`));
    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

  return (
    <section className="relative bg-fiebriAzul py-20 px-6 overflow-hidden min-h-[70vh] flex items-center">
      
      {/* ⚽️ Balones decorativos animados */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -right-20 text-white/5 text-[25rem] z-0 pointer-events-none"
      >
        <FaFutbol />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-20 -left-20 text-fiebriVerde/5 text-[30rem] z-0 pointer-events-none"
      >
        <FaFutbol />
      </motion.div>

      {/* 🏟️ Contenedor Principal (Dividido en 2 columnas en Desktop) */}
      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12 mt-10">
        
        {/* 🔹 MITAD IZQUIERDA: Textos y Botones */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
        >
        
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl lg:text-[7rem] font-black text-white italic uppercase leading-[0.85] tracking-tighter mb-6 drop-shadow-2xl">
            FIEBRI<br />
            <span className="text-fiebriVerde">TICOS</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-white/80 text-lg md:text-xl font-medium max-w-lg mb-10 leading-relaxed">
            Las mejores chemas del país con la calidad que solo un verdadero fiebre reconoce.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 w-full sm:w-auto">
            
          </motion.div>
        </motion.div>

        {/* 🔹 MITAD DERECHA: Animación de las 3 Chemas */}
        <div className="lg:w-5/12 w-full flex flex-col gap-4 relative">
          {chemas.map((chema, index) => {
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={chema.id}
                layout
                onClick={() => setActiveIndex(index)}
                className={`relative cursor-pointer flex items-center p-4 rounded-[2rem] transition-all duration-500 border-2 overflow-hidden ${
                  isActive
                    ? "bg-fiebriVerde border-fiebriVerde shadow-[0_0_40px_rgba(34,197,94,0.3)] scale-105 z-10"
                    : "bg-white/5 border-white/10 backdrop-blur-md scale-95 opacity-60 hover:opacity-100 z-0"
                }`}
              >
                {/* Imagen de la chema */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 relative flex justify-center items-center">
                  <img 
                    src={chema.img} 
                    alt={chema.name} 
                    className={`object-contain drop-shadow-2xl transition-all duration-500 ${isActive ? "scale-110" : "scale-90 grayscale-[30%]"}`} 
                  />
                </div>

                {/* Textos y Botón Interno */}
                <div className="ml-2 sm:ml-6 flex-1">
                  <h3 className={`text-xl sm:text-2xl font-black uppercase italic tracking-tighter transition-colors ${isActive ? "text-fiebriAzul" : "text-white"}`}>
                    {chema.name}
                  </h3>
                  <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? "text-fiebriAzul/70" : "text-white/50"}`}>
                    {chema.desc}
                  </p>
                  
                  {/* El botón aparece mágicamente cuando está activo */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.button
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que se dispare el click del contenedor
                          handleFiltrar(chema.id);
                        }}
                        className="bg-white text-green-600 text-[10px] sm:text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform"
                      >
                         Ver Modelos
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}