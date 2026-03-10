import { useState } from "react";
import { toast } from "react-toastify";
import { FaTimes, FaEye, FaEyeSlash, FaUser, FaPhone, FaEnvelope, FaLock, FaFutbol, FaShieldAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || "https://fiebriticos.onrender.com";

export default function RegisterUserModal({ onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Roles de administración
  const [roles, setRoles] = useState({
    add: false,
    edit: false,
    delete: false,
    history: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= 8) setFormData({ ...formData, phone: value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.firstName || formData.phone.length !== 8) {
      return toast.warning("Completa los campos obligatorios y el celular de 8 dígitos");
    }

    setLoading(true);

    try {
      const selectedRoles = Object.entries(roles)
        .filter(([, value]) => value)
        .map(([key]) => key);

      const payload = { 
        username: formData.email, 
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        password: formData.password,
        roles: selectedRoles 
      };

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Fichaje completado: Usuario creado");
        onClose?.(); 
      } else {
        toast.error(data.message || "Error al registrar");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-fiebriAzul/60 backdrop-blur-md px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-[2.5rem] bg-white shadow-2xl overflow-hidden border-b-8 border-fiebriVerde max-h-[90vh] flex flex-col"
      >
        
        {/* Header - Azul Fiebriticos */}
        <div className="bg-fiebriAzul p-8 text-center relative overflow-hidden flex-shrink-0">
          <FaFutbol className="absolute -top-4 -left-4 text-white/5 text-7xl rotate-12" />
          <button onClick={onClose} className="absolute right-5 top-5 text-white/50 hover:text-fiebriVerde transition-colors z-20">
            <FaTimes size={24} />
          </button>
          
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Nuevo <span className="text-fiebriVerde">Fichaje</span>
          </h2>
          <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest mt-2">
            Registro de Administradores
          </p>
        </div>

        {/* Formulario con Scroll interno si es necesario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-fiebriAzul">
          
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Nombre</label>
               <div className="relative">
                 <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                 <input 
                   name="firstName" 
                   type="text" 
                   placeholder="Ej: Steven" 
                   className="w-full bg-fiebriGris border-none pl-11 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-fiebriAzul transition-all"
                   onChange={handleChange}
                   required
                 />
               </div>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Apellido</label>
               <input 
                 name="lastName" 
                 type="text" 
                 placeholder="Opcional" 
                 className="w-full bg-fiebriGris border-none px-5 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-fiebriAzul transition-all"
                 onChange={handleChange}
               />
            </div>
          </div>

          {/* Celular y Correo */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Celular Tico</label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input 
                   name="phone" 
                   type="tel" 
                   value={formData.phone}
                   placeholder="8888 8888" 
                   className="w-full bg-fiebriGris border-none pl-11 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-fiebriAzul transition-all font-bold"
                   onChange={handlePhoneChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Correo Electrónico</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input 
                   name="email" 
                   type="email" 
                   placeholder="admin@fiebriticos.com" 
                   className="w-full bg-fiebriGris border-none pl-11 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-fiebriAzul transition-all"
                   onChange={handleChange}
                   required
                />
              </div>
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Clave de Acceso</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="w-full bg-fiebriGris border-none pl-11 pr-12 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-fiebriAzul transition-all"
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fiebriAzul bg-transparent"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="flex gap-4 mt-2 ml-2">
               <p className={`text-[9px] font-black uppercase flex items-center gap-1 ${formData.password.length >= 6 ? 'text-fiebriVerde' : 'text-gray-300'}`}>
                 {formData.password.length >= 6 ? '✓' : '○'} 6+ Letras
               </p>
               <p className={`text-[9px] font-black uppercase flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-fiebriVerde' : 'text-gray-300'}`}>
                 {/[0-9]/.test(formData.password) ? '✓' : '○'} Un Número
               </p>
            </div>
          </div>

          {/* Permisos (Roles) */}
          <div className="pt-4 border-t border-fiebriGris">
            <div className="flex items-center gap-2 mb-3 ml-2">
              <FaShieldAlt className="text-fiebriAzul text-xs" />
              <p className="text-[10px] font-black text-fiebriAzul uppercase tracking-widest">Permisos del Sistema</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "add", label: "Agregar" },
                { key: "edit", label: "Editar" },
                { key: "delete", label: "Eliminar" },
                { key: "history", label: "Bitácora" }
              ].map(({ key, label }) => (
                <label key={key} className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${roles[key] ? 'border-fiebriVerde bg-fiebriVerde/5' : 'border-transparent bg-fiebriGris hover:bg-gray-200'}`}>
                  <span className={`text-[10px] font-black uppercase ${roles[key] ? 'text-fiebriAzul' : 'text-gray-400'}`}>{label}</span>
                  <input
                    type="checkbox"
                    checked={roles[key]}
                    onChange={() => setRoles((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${roles[key] ? 'bg-fiebriVerde border-fiebriVerde' : 'bg-white border-gray-300'}`}>
                    {roles[key] && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Botón de Creación */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="boton-fiebri-verde w-full py-4 text-white rounded-2xl font-black text-lg uppercase tracking-tighter italic shadow-xl shadow-fiebriVerde/20 transition-all disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Confirmar Fichaje"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}