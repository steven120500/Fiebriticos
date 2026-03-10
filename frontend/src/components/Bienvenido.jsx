import { motion } from "framer-motion";
import { FaFutbol } from "react-icons/fa";

export default function Bienvenido() {
  return (
    <section className="relative bg-fiebriAzul py-20 px-6 overflow-hidden">
      {/* Balones decorativos de fondo con opacidad baja */}
      <FaFutbol className="absolute -top-10 -right-10 text-white/5 text-[20rem] rotate-12" />
      <FaFutbol className="absolute -bottom-20 -left-20 text-fiebriVerde/5 text-[25rem] -rotate-12" />

      <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:w-2/3"
        >
          <span className="inline-block bg-fiebriVerde text-fiebriAzul px-4 py-1 rounded-full font-black text-xs uppercase tracking-[0.3em] mb-6 shadow-lg shadow-fiebriVerde/20">
            Temporada 2026
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-white italic uppercase leading-none tracking-tighter mb-4">
            FIEBRE <span className="text-fiebriVerde text-shadow-glow">TOTAL</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl font-medium max-w-xl mb-10 leading-relaxed">
            La élite del fútbol en tu piel. Las mejores chemas del país con la calidad que solo un verdadero fiebre reconoce.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <button 
              onClick={() => window.dispatchEvent(new Event('filtrarPlayer'))}
              className="boton-fiebri-verde px-10 py-5 rounded-2xl font-black text-xl uppercase italic shadow-2xl active:scale-95 transition-all"
            >
              VER PLAYER
            </button>
            <button 
              onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
              className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-10 py-5 rounded-2xl font-black text-xl uppercase italic hover:bg-white hover:text-fiebriAzul transition-all"
            >
              EXPLORAR
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}