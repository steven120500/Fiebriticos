import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Contacto() {
  return (
    <div className="w-full py-10 flex flex-col items-center gap-6 bg-fiebriGris rounded-3xl mt-10 shadow-inner">
      
      {/* Texto de llamado a la acción */}
      <div className="text-center">
        <p className="text-fiebriAzul text-xs uppercase tracking-[0.3em] font-black mb-1">
          Únete a la comunidad
        </p>
        <h3 className="text-2xl font-black text-fiebriAzul italic uppercase tracking-tighter">
          FIEBRITICOS <span className="text-fiebriVerde">CR</span>
        </h3>
      </div>

      {/* Íconos sociales con estilo de la caja */}
      <div className="flex justify-center gap-8">
        
        {/* FACEBOOK */}
        <motion.a
          href="https://www.facebook.com/profile.php?id=61559013514708" // Actualizar si cambia
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 flex items-center justify-center rounded-2xl bg-fiebriAzul border-b-4 border-fiebriVerde shadow-xl group transition-all"
        >
          <FaFacebookF className="text-2xl text-white group-hover:text-fiebriVerde transition-colors" />
        </motion.a>

        {/* INSTAGRAM */}
        <motion.a
          href="https://www.instagram.com/fiebriticos_cr/" // Cambié el link para que sea coherente con la marca
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 flex items-center justify-center rounded-2xl bg-fiebriAzul border-b-4 border-fiebriVerde shadow-xl group transition-all"
        >
          <FaInstagram className="text-2xl text-white group-hover:text-fiebriVerde transition-colors" />
        </motion.a>

        {/* WHATSAPP - El contacto principal */}
        <motion.a
          href="https://wa.me/50688028216" // ✅ Número oficial actualizado
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, y: -5 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 flex items-center justify-center rounded-2xl bg-fiebriVerde border-b-4 border-fiebriAzul shadow-xl group transition-all"
        >
          <FaWhatsapp className="text-3xl text-fiebriAzul group-hover:scale-110 transition-transform" />
        </motion.a>

      </div>

      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">
        Atención de Lunes a Sábado • Envíos Express
      </p>
    </div>
  );
}