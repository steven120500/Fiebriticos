import React from 'react';
import { useCart } from '../context/CartContext';
import { FaTimes, FaTrash, FaWhatsapp, FaFutbol } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { cart, removeFromCart, isCartOpen, toggleCart, cartTotal } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // ✅ Mensaje personalizado con la marca Fiebriticos
    let mensaje = "⚽ *¡HOLA FIEBRITICOS!* ⚽\n\n";
    mensaje += "Quiero realizar el siguiente pedido del catálogo:\n";
    mensaje += "----------------------------------\n";
    
    cart.forEach((item) => {
      const price = item.discountPrice || item.price;
      mensaje += `👕 *${item.name}*\n`;
      mensaje += `   Talla: ${item.selectedSize}\n`;
      mensaje += `   Cant: ${item.quantity} - ₡${(price * item.quantity).toLocaleString()}\n\n`;
    });
    
    mensaje += "----------------------------------\n";
    mensaje += `💰 *TOTAL A PAGAR: ₡${cartTotal.toLocaleString()}*`;
    
    // ✅ Usamos el número de Fiebriticos
    window.open(`https://wa.me/50688028216?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Fondo oscuro con desenfoque pro */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-fiebriAzul/40 z-[100] backdrop-blur-md"
            onClick={toggleCart}
          />
          
          {/* Panel del Carrito - Estilo Premium */}
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-fiebriGris z-[101] shadow-2xl flex flex-col"
          >
            {/* Header - Azul Fiebriticos */}
            <div className="p-6 bg-fiebriAzul text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <FaFutbol className="text-fiebriVerde animate-bounce" size={24} />
                <h2 className="text-2xl font-black tracking-tighter uppercase italic">Tu Pedido</h2>
              </div>
              <button onClick={toggleCart} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <FaTimes size={24} />
              </button>
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-custom">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <FaFutbol size={40} className="text-gray-200" />
                  </div>
                  <p className="text-fiebriAzul font-bold text-xl">¿Todavía sin chema?</p>
                  <p className="text-gray-400 text-sm mt-2">El catálogo está lleno de joyas.</p>
                  <button 
                    onClick={toggleCart} 
                    className="mt-8 text-fiebriVerde font-black uppercase tracking-widest hover:scale-110 transition"
                  >
                    Ir a la cancha ⚽
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`${item._id}-${item.selectedSize}-${index}`} 
                    className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
                  >
                    <img 
                      src={item.imageSrc || "https://via.placeholder.com/100"} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-xl shadow-inner" 
                    />
                    <div className="flex-1">
                      <h3 className="font-extrabold text-sm text-fiebriAzul leading-tight uppercase">{item.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] font-black bg-fiebriGris text-fiebriAzul px-2 py-0.5 rounded-full">
                          TALLA {item.selectedSize}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-3">
                        <span className="font-black text-fiebriVerde text-lg">
                          ₡{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-bold text-gray-400">Cant: {item.quantity}</span>
                           <button 
                             onClick={() => removeFromCart(item._id || item.id, item.selectedSize)} 
                             className="text-red-400 hover:text-red-600 transition-colors p-1"
                           >
                             <FaTrash size={16} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer - El gran cierre */}
            {cart.length > 0 && (
              <div className="p-8 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total del pedido</span>
                  <span className="text-3xl font-black text-fiebriAzul tracking-tighter">
                    ₡{cartTotal.toLocaleString()}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="boton-fiebri-verde w-full py-5 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(34,197,94,0.4)]"
                >
                  <FaWhatsapp size={28} />
                  ENVIAR A WHATSAPP
                </button>
                
                <p className="text-center text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">
                  Atención inmediata • Envíos a todo el país
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}