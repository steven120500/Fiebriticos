import { FaFacebookF, FaInstagram, FaWhatsapp, FaFutbol } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-fiebriAzul text-white pt-16 pb-8 border-t-4 border-fiebriVerde">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        
        {/* Logo / Nombre en el Footer */}
        <div className="flex items-center gap-2 mb-6">
          <FaFutbol className="text-fiebriVerde animate-spin-slow" size={24} />
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            FIEBRITICOS <span className="text-fiebriVerde">CR</span>
          </h2>
        </div>

        {/* Enlaces Rápidos o Frase de Marca */}
        <p className="text-gray-300 text-sm max-w-xs text-center mb-8 font-medium">
          La mejor calidad en camisetas de fútbol en Costa Rica. Pasión por el deporte en cada fibra.
        </p>

        {/* Redes Sociales Rápidas */}
        <div className="flex gap-6 mb-10">
          <a href="#" className="hover:text-fiebriVerde transition-colors"><FaFacebookF size={20} /></a>
          <a href="#" className="hover:text-fiebriVerde transition-colors"><FaInstagram size={20} /></a>
          <a href="https://wa.me/50688028216" className="hover:text-fiebriVerde transition-colors"><FaWhatsapp size={20} /></a>
        </div>

        {/* Divisor */}
        <div className="w-full h-px bg-white/10 mb-8" />

        {/* Texto inferior y Créditos */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          <p>© {currentYear} FIEBRITICOS. TODOS LOS DERECHOS RESERVADOS.</p>
          
          <p className="flex items-center gap-2">
            DESARROLLADO POR{" "}
            <a
              href="https://wa.me/50688028216"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fiebriVerde hover:text-white transition-colors border-b border-fiebriVerde pb-0.5"
            >
              STEVEN CORRALES ALFARO
            </a>
          </p>
        </div>
      </div>

      {/* Decoración de fondo */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </footer>
  );
}