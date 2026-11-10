import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FaFutbol, FaArrowRight, FaTag, FaTruck, FaTshirt, FaChild } from "react-icons/fa";
import MundialBanner from "./MundialBanner"; // 👈 Banner mundialista (desactivado abajo)

const AUTOPLAY_MS = 3500;

// 🔹 Nuestras 3 joyas estrella
const chemas = [
  { id: "Player", name: "Versión Player", img: "/PlayerB.png", desc: "Ajuste Profesional" },
  { id: "Fan", name: "Versión Fan", img: "/FanB.png", desc: "Máximo Confort" },
  { id: "Retro", name: "Retro", img: "/RetroB.png", desc: "Clásicos Eternos" },
];

const beneficios = [
  { icon: FaTruck, text: "Envíos a todo el país" },
  { icon: FaTshirt, text: "Tallas S a 4XL" },
  { icon: FaChild, text: "Versión niño" },
];

export default function Bienvenido({ setFilterType }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  // ⏱️ Cambio automático (se pausa con el mouse encima o si el usuario prefiere menos movimiento)
  useEffect(() => {
    if (paused || reduceMotion) return;
    const t = setTimeout(() => setActiveIndex((prev) => (prev + 1) % chemas.length), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [activeIndex, paused, reduceMotion]);

  // 🎯 Coreografía de entrada del texto
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const handleFiltrar = (tipo) => {
    setFilterType?.(tipo);
    const catalogElement = document.getElementById("search-section");
    if (catalogElement) catalogElement.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 800, behavior: "smooth" });
  };

  return (
    <section className="relative bg-fiebriAzul pt-16 pb-28 px-6 overflow-hidden min-h-[70vh] flex items-center">
      {/* 🌟 Resplandor de fondo detrás de las chemas */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_75%_50%,rgba(34,197,94,0.22),transparent_55%),radial-gradient(ellipse_at_10%_0%,rgba(255,255,255,0.08),transparent_45%)]" />

      {/* ⚽️ Balón decorativo */}
      <motion.div
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute -top-24 -left-24 text-white/[0.04] text-[26rem] z-0 pointer-events-none"
      >
        <FaFutbol />
      </motion.div>

      <div className="w-full relative z-10 flex flex-col mt-10">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* 🔹 MITAD IZQUIERDA: Textos y llamados a la acción */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
            className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/90 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-fiebriVerde animate-pulse" />
              Camisetas de fútbol · Costa Rica
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl lg:text-[7rem] font-black text-white italic uppercase leading-[0.85] tracking-tighter mb-6 drop-shadow-2xl"
            >
              FIEBRI<br />
              <span className="text-fiebriVerde">TICOS</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-white/80 text-base md:text-xl font-medium max-w-lg mb-8 leading-relaxed"
            >
              Las mejores chemas del país con la calidad que solo un verdadero fiebre reconoce.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              <button
                onClick={() => handleFiltrar("")}
                className="group bg-fiebriVerde text-fiebriAzul font-black uppercase tracking-widest text-xs sm:text-sm px-7 py-4 rounded-2xl flex items-center gap-3 shadow-[0_10px_30px_rgba(34,197,94,0.35)] hover:scale-105 active:scale-95 transition-transform"
              >
                Ver catálogo
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => handleFiltrar("Ofertas")}
                className="bg-white/10 border-2 border-white/20 text-white font-black uppercase tracking-widest text-xs sm:text-sm px-7 py-4 rounded-2xl flex items-center gap-3 hover:bg-white hover:text-fiebriAzul transition-colors"
              >
                <FaTag /> Ofertas
              </button>
            </motion.div>

            <motion.ul variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2">
              {beneficios.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-white/80 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <Icon className="text-fiebriVerde" /> {text}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* 🔹 MITAD DERECHA: Las 3 chemas */}
          <div
            className="lg:w-5/12 w-full flex flex-col gap-4 relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {chemas.map((chema, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={chema.id}
                  layout
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      isActive ? handleFiltrar(chema.id) : setActiveIndex(index);
                    }
                  }}
                  className={`relative cursor-pointer flex items-center p-4 rounded-[2rem] transition-all duration-500 border-2 overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-white/40 ${
                    isActive
                      ? "bg-fiebriVerde border-fiebriVerde shadow-[0_0_40px_rgba(34,197,94,0.3)] scale-105 z-10"
                      : "bg-white/5 border-white/10 backdrop-blur-md scale-95 opacity-60 hover:opacity-100 z-0"
                  }`}
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 relative flex justify-center items-center">
                    <img
                      src={chema.img}
                      alt={chema.name}
                      className={`object-contain drop-shadow-2xl transition-all duration-500 ${isActive ? "scale-110 -rotate-3" : "scale-90 grayscale-[30%]"}`}
                    />
                  </div>

                  <div className="ml-2 sm:ml-6 flex-1">
                    <h3 className={`text-xl sm:text-2xl font-black uppercase italic tracking-tighter transition-colors ${isActive ? "text-fiebriAzul" : "text-white"}`}>
                      {chema.name}
                    </h3>
                    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? "text-fiebriAzul/70" : "text-white/50"}`}>
                      {chema.desc}
                    </p>

                    <AnimatePresence>
                      {isActive && (
                        <motion.button
                          tabIndex={-1}
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFiltrar(chema.id);
                          }}
                          className="bg-fiebriAzul text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-transform"
                        >
                          Ver {chema.id} <FaArrowRight />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ⏳ Barra de progreso hasta el siguiente cambio */}
                  {isActive && !paused && !reduceMotion && (
                    <motion.div
                      key={`bar-${activeIndex}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-1 bg-fiebriAzul/40"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 🌎 BANNER MUNDIALISTA 2026 - QUITADO TEMPORALMENTE
        <div className="max-w-7xl mx-auto w-full mt-10">
          <MundialBanner onMundialClick={() => handleFiltrar("Mundialista")} />
        </div>
        */}
      </div>

      {/* 〰️ Corte diagonal hacia el catálogo */}
      <svg
        className="absolute bottom-0 left-0 w-full h-16 sm:h-24 text-fiebriGris z-10 pointer-events-none"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M0,100 L0,60 Q720,0 1440,60 L1440,100 Z" />
      </svg>
    </section>
  );
}
