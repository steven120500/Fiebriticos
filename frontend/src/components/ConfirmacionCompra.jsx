import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaWhatsapp, FaArrowLeft, FaFutbol } from 'react-icons/fa';

const ConfirmacionCompra = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = location.state || {}; 

  return (
    <div className="min-h-screen bg-fiebriGris flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden text-center"
      >
        {/* Header con el Balón Fiebri */}
        <div className="bg-fiebriAzul p-10 flex justify-center relative overflow-hidden">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="z-10"
          >
            <FaCheckCircle className="text-fiebriVerde text-8xl drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
          </motion.div>
          {/* Balones de fondo decorativos */}
          <FaFutbol className="absolute -bottom-4 -left-4 text-white/10 text-6xl rotate-12" />
          <FaFutbol className="absolute -top-4 -right-4 text-white/10 text-8xl -rotate-12" />
        </div>

        {/* Contenido */}
        <div className="p-8">
          <h1 className="text-3xl font-black text-fiebriAzul leading-tight uppercase tracking-tighter">
            ¡PEDIDO ENVIADO <br/> CON ÉXITO!
          </h1>
          
          <div className="w-16 h-1.5 bg-fiebriVerde mx-auto my-6 rounded-full" />

          <p className="text-gray-500 font-medium text-lg px-4">
            ¡Excelente jugada! Tu pedido ya fue enviado a nuestro **WhatsApp oficial**.
          </p>

          <div className="mt-8 p-4 bg-fiebriGris rounded-2xl flex items-center gap-4 border border-gray-100">
             <div className="bg-fiebriVerde p-3 rounded-xl shadow-lg">
                <FaWhatsapp className="text-fiebriAzul text-2xl" />
             </div>
             <div className="text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</p>
                <p className="text-fiebriAzul font-black text-sm">Esperando respuesta del asesor</p>
             </div>
          </div>

          {orderId && (
            <p className="mt-6 text-sm text-gray-400 font-bold uppercase tracking-widest">
              ID de Referencia: <span className="text-fiebriAzul">#{orderId}</span>
            </p>
          )}

          {/* Botones */}
          <div className="mt-10 space-y-3">
            <button 
              onClick={() => navigate('/')}
              className="boton-fiebri-verde w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-2"
            >
              <FaArrowLeft /> VOLVER AL CATÁLOGO
            </button>
            
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
              Gracias por confiar en Fiebriticos
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmacionCompra;