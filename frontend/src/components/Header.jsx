import logo from "../assets/logo.png";
import { FaTimes, FaShoppingCart, FaUser, FaBoxOpen, FaHistory, FaFutbol } from "react-icons/fa"; 
import { LiaRulerSolid } from "react-icons/lia";
import { FiPhoneCall } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Contacto from "./Contacto"; 
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({
  onLoginClick,
  onLogout,
  onLogoClick,
  user,
  canSeeHistory,
  isSuperUser,
  setShowRegisterUserModal,
  setShowUserListModal,
  onMedidasClick,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showContacto, setShowContacto] = useState(false);
  
  const navigate = useNavigate();
  const { cartCount, toggleCart } = useCart();

  const getInitials = (name) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="px-4 sm:px-10 py-3 fixed w-full top-0 left-0 z-50 transition-all duration-300 bg-fiebriAzul border-b-2 border-fiebriVerde shadow-2xl">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        
        {/* 🔹 IZQUIERDA: Logo y Accesos */}
        <div className="flex items-center gap-2 sm:gap-8">
          <button onClick={() => { navigate('/'); if (onLogoClick) onLogoClick(); }} className="focus:outline-none hover:scale-105 transition-transform">
            <img src={logo} alt="Fiebriticos Logo" className="h-12 sm:h-20 object-contain" />
          </button>

          <div className="flex gap-2">
            <button onClick={onMedidasClick} className="text-white text-[10px] sm:text-xs bg-white/10 backdrop-blur-md border border-white/20 font-black px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-fiebriVerde hover:text-fiebriAzul transition-all uppercase tracking-tighter">
              <LiaRulerSolid size={18} /> <span className="hidden lg:inline">Guía de Tallas</span>
            </button>
            <button onClick={() => setShowContacto(true)} className="text-white text-[10px] sm:text-xs bg-white/10 backdrop-blur-md border border-white/20 font-black px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-fiebriVerde hover:text-fiebriAzul transition-all uppercase tracking-tighter">
              <FiPhoneCall size={16} /> <span className="hidden lg:inline">Contacto</span>
            </button>
          </div>
        </div>

        {/* 🔹 DERECHA: Carrito y Perfil */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button onClick={toggleCart} className="relative bg-fiebriVerde text-fiebriAzul p-3.5 rounded-2xl shadow-lg hover:scale-110 transition-all active:scale-95">
            <FaShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-fiebriAzul text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-fiebriVerde animate-pulse shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          <button onClick={() => setSidebarOpen(true)} className="rounded-2xl bg-white/10 border border-white/20 p-1 w-12 h-12 flex items-center justify-center shadow-xl hover:border-fiebriVerde transition-all overflow-hidden group">
            {user ? (
              <div className="bg-fiebriVerde w-full h-full flex items-center justify-center">
                <span className="font-black text-sm tracking-tighter text-fiebriAzul">{getInitials(user.firstName || user.username)}</span>
              </div>
            ) : (
              <FaUser size={20} className="text-white group-hover:text-fiebriVerde" />
            )}
          </button>
        </div>
      </div>

      {/* 🔸 SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-fiebriAzul/60 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-80 bg-white z-[101] shadow-2xl flex flex-col p-8" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSidebarOpen(false)} className="absolute text-fiebriAzul top-6 right-6 hover:rotate-90 transition-transform">
                <FaTimes size={28} />
              </button>

              {user ? (
                <div className="mt-8 flex-grow">
                  <div className="mb-10 border-b border-fiebriGris pb-8 text-center">
                    <div className="w-20 h-20 bg-fiebriAzul rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl border-b-4 border-fiebriVerde">
                      <span className="text-fiebriVerde font-black text-2xl">{getInitials(user.firstName || user.username)}</span>
                    </div>
                    <p className="text-fiebriAzul font-black text-2xl truncate">{user.firstName || user.username}</p>
                  </div>

                  <nav className="space-y-3">
                    {isSuperUser && (
                      <>
                        <button onClick={() => { setShowRegisterUserModal(true); setSidebarOpen(false); }} className="w-full text-fiebriAzul font-bold text-left px-5 py-3.5 rounded-2xl hover:bg-fiebriGris transition flex items-center gap-4">
                          <FaUser size={16} className="text-fiebriVerde"/> Agregar Usuario
                        </button>
                        <button onClick={() => { setShowUserListModal(true); setSidebarOpen(false); }} className="w-full text-fiebriAzul font-bold text-left px-5 py-3.5 rounded-2xl hover:bg-fiebriGris transition flex items-center gap-4">
                          <FaUser size={16} className="text-fiebriVerde"/> Lista de Usuarios
                        </button>
                      </>
                    )}
                    {canSeeHistory && (
                      <button onClick={() => { navigate('/historial'); setSidebarOpen(false); }} className="w-full text-fiebriAzul font-bold text-left px-5 py-3.5 rounded-2xl hover:bg-fiebriGris transition flex items-center gap-4">
                        <FaHistory size={16} className="text-fiebriVerde"/> Historial
                      </button>
                    )}
                    <button onClick={() => { navigate('/pedidos'); setSidebarOpen(false); }} className="w-full bg-fiebriAzul text-white font-black text-left px-5 py-4 rounded-2xl flex items-center gap-4 mt-6">
                      <FaBoxOpen size={20} className="text-fiebriVerde" /> GESTIÓN PEDIDOS
                    </button>
                  </nav>

                  <button onClick={() => { onLogout(); setSidebarOpen(false); }} className="w-full mt-12 px-4 py-4 rounded-2xl font-black text-red-500 hover:bg-red-50 transition-colors uppercase text-[10px] tracking-widest border-2 border-red-50">
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="text-center mt-20">
                  <div className="w-24 h-24 bg-fiebriGris rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <FaUser size={40} className="text-fiebriAzul/20" />
                  </div>
                  <h3 className="text-fiebriAzul font-black text-3xl mb-10 tracking-tighter uppercase italic">¡HOLA FIEBRE!</h3>
                  <button onClick={() => { onLoginClick(); setSidebarOpen(false); }} className="boton-fiebri-verde w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest shadow-2xl">
                    ENTRAR AL PANEL
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🔹 MODAL CONTACTO */}
      <AnimatePresence>
        {showContacto && (
          <div className="fixed inset-0 bg-fiebriAzul/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-2xl relative w-full max-w-md border-b-8 border-fiebriVerde">
              <button onClick={() => setShowContacto(false)} className="absolute top-6 right-6 text-gray-300 hover:text-fiebriAzul transition">
                <FaTimes size={28} />
              </button>
              <h2 className="text-3xl font-black text-fiebriAzul uppercase mb-2 tracking-tighter">Hablemos</h2>
              <Contacto />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}