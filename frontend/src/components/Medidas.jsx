import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaFutbol } from "react-icons/fa";
import { LiaRulerSolid } from "react-icons/lia";
import { motion, AnimatePresence } from "framer-motion"; 

// 🔽 Importamos las imágenes
import fanImg from "../assets/Fan.png";
import playerImg from "../assets/Player.png";

export default function Medidas({ open, onClose }) {
  
  // Bloquear scroll del body
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  if (!open) return null;

  const CATALOG = [
    { 
      key: "Player", 
      label: "Versión Player", 
      badge: "Ajuste Pro",
      img: playerImg, 
      desc: "Corte atlético pegado al cuerpo. Ideal si prefieres lucir como el jugador en la cancha." 
    },
    { 
      key: "Fan", 
      label: "Versión Fan", 
      badge: "Ajuste Cómodo",
      img: fanImg, 
      desc: "Corte recto y holgado. La opción clásica para el uso diario y máximo confort." 
    },
  ];

  const modal = (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-fiebriAzul/60 backdrop-blur-md">
      
      <div 
        className="flex min-h-full items-center justify-center p-4 py-12"
        onClick={onClose}
      >
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border-b-8 border-fiebriVerde"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* HEADER ESTILO FIEBRITICOS */}
          <div className="bg-fiebriAzul p-8 text-center relative overflow-hidden">
             {/* Balones de fondo decorativos */}
             <FaFutbol className="absolute -top-4 -left-4 text-white/5 text-7xl rotate-12" />
             
             <button
                onClick={onClose}
                className="absolute top-5 right-5 text-white/50 hover:text-fiebriVerde transition-colors z-20"
              >
                <FaTimes size={24} />
              </button>

              <div className="flex justify-center mb-2">
                <div className="bg-fiebriVerde p-3 rounded-2xl shadow-lg">
                  <LiaRulerSolid className="text-fiebriAzul text-3xl" />
                </div>
              </div>

              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                Guía de <span className="text-fiebriVerde">Tallas</span>
              </h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                Asegura el ajuste perfecto para tu piel
              </p>
          </div>

          {/* BODY */}
          <div className="p-8 space-y-10 bg-white">
            
            {CATALOG.map(({ key, label, badge, img, desc }) => (
              <div key={key} className="relative">
                
                {/* Título de Versión */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-fiebriVerde rounded-full" />
                    <h4 className="text-2xl font-black text-fiebriAzul uppercase italic tracking-tighter">
                      {label}
                    </h4>
                  </div>
                  <span className="bg-fiebriGris text-fiebriAzul text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    {badge}
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-gray-500 text-sm mb-6 px-2 font-medium leading-relaxed">
                  {desc}
                </p>

                {/* ✂️ CONTENEDOR DE IMAGEN (Con Recorte Automático) */}
                <div className="bg-fiebriGris rounded-[2rem] p-3 border-2 border-gray-50 shadow-inner group hover:border-fiebriVerde/30 transition-all">
                  {/* Aquí está el truco: Altura fija (h-[320px] y overflow-hidden para cortar el fondo largo) */}
                  <div className="bg-white rounded-[1.5rem] w-full h-[400px] sm:h-[700px] overflow-hidden shadow-sm flex items-start justify-center">
                    <img
                      src={img}
                      alt={`Medidas ${label}`}
                      className="w-full h-auto object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* BOTÓN DE CIERRE (ESTILO CAJA) */}
            <div className="pt-4">
              <button
                onClick={onClose}
                className="boton-fiebri-verde w-full py-5 rounded-2xl text-white font-black text-xl shadow-xl flex items-center justify-center gap-3 uppercase tracking-tighter italic"
              >
                ¡ENTENDIDO! <FaFutbol />
              </button>
              
              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                Fiebriticos CR • Especialistas en Calidad
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}