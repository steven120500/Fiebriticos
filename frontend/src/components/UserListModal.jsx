import React, { useEffect, useState } from "react";
import { toast as toastHOT } from "react-hot-toast";
import { FaUsers, FaTimes, FaTrashAlt, FaShieldAlt, FaUserCircle, FaFutbol } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || "https://fiebriticos.onrender.com";

export default function UserListModal({ open, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (open) fetchUsers();
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = currentUser.token; 
      const res = await fetch(`${API_BASE}/api/auth/users`, { 
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      toastHOT.error("Error al convocar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const doDeleteUser = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser.token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toastHOT.success("Usuario fuera de la convocatoria");
    } catch (e) {
      toastHOT.error("Error al eliminar al usuario");
    }
  };

  const askDeleteUser = (u) => {
    if (currentUser.email === u.email) return toastHOT.error("No puedes auto-eliminarte");
    if (u.isSuperUser) return toastHOT.error("El Superadmin está protegido");

    toastHOT((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-xs font-bold text-fiebriAzul uppercase">¿Eliminar a <span className="text-red-500">{u.firstName || u.username}</span>?</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toastHOT.dismiss(t.id)} className="bg-fiebriGris px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">Cancelar</button>
          <button onClick={() => { toastHOT.dismiss(t.id); doDeleteUser(u._id); }} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-red-200">Confirmar</button>
        </div>
      </div>
    ), { duration: 6000, style: { borderRadius: '1rem', border: '2px solid #ef4444' } });
  };

  const getRoleDisplay = (u) => {
    if (u.isSuperUser) return "Superadmin";
    const mapRoles = { add: "Agregar", edit: "Editar", delete: "Eliminar", history: "Bitácora" };
    return u.roles?.length > 0 ? u.roles.map(r => mapRoles[r] || r).join(", ") : "Sin Permisos";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-fiebriAzul/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border-b-8 border-fiebriVerde flex flex-col max-h-[85vh]"
      >
        {/* Header Estilo Fiebriticos */}
        <div className="bg-fiebriAzul p-8 text-center relative overflow-hidden flex-shrink-0">
          <FaFutbol className="absolute -top-4 -left-4 text-white/5 text-8xl rotate-12" />
          <button onClick={onClose} className="absolute right-6 top-6 text-white/50 hover:text-fiebriVerde transition-all">
            <FaTimes size={24} />
          </button>
          
          <div className="flex justify-center mb-2">
            <div className="bg-fiebriVerde p-3 rounded-2xl shadow-lg">
              <FaUsers className="text-fiebriAzul text-2xl" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            Gestión de <span className="text-fiebriVerde">Staff</span>
          </h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Control de accesos al sistema</p>
        </div>

        {/* Lista de Usuarios */}
        <div className="p-6 overflow-y-auto scroll-custom flex-grow bg-white">
          <div className="space-y-3">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <FaFutbol className="animate-spin text-fiebriAzul/20 text-4xl" />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Cargando Plantilla...</p>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-gray-400 py-10 font-bold uppercase text-xs">No hay otros usuarios registrados.</p>
            ) : (
              users.map((u) => {
                const isMe = currentUser.email === u.email;
                const isSuper = u.isSuperUser;
                const canDelete = !isMe && !isSuper;

                return (
                  <motion.div 
                    layout key={u._id} 
                    className="flex items-center justify-between p-4 bg-fiebriGris rounded-2xl border-2 border-transparent hover:border-fiebriVerde/30 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${isMe ? 'bg-fiebriVerde text-fiebriAzul' : 'bg-white text-fiebriAzul'}`}>
                        {isSuper ? <FaShieldAlt size={20} /> : <FaUserCircle size={22} />}
                      </div>
                      
                      <div className="flex flex-col">
                        <h3 className="font-black text-fiebriAzul uppercase tracking-tight text-sm flex items-center gap-2">
                          {u.firstName || u.username} {u.lastName || ""}
                          {isMe && <span className="text-[8px] bg-fiebriAzul text-white px-2 py-0.5 rounded-full">TÚ</span>}
                        </h3>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isSuper ? 'text-fiebriAzul' : 'text-gray-400'}`}>
                          {getRoleDisplay(u)}
                        </p>
                      </div>
                    </div>

                    <div>
                      {canDelete ? (
                        <button 
                          onClick={() => askDeleteUser(u)}
                          className="p-3 bg-white text-gray-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm group-hover:bg-red-50"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      ) : (
                        <div className="px-3 py-1 bg-white/50 border border-gray-100 rounded-lg">
                           <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">
                            {isMe ? "Online" : "Protegido"}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-6 bg-fiebriGris border-t border-gray-100 flex justify-center">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-fiebriAzul text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-fiebriAzul/90 transition-all active:scale-95"
            >
              Cerrar Plantilla
            </button>
        </div>
      </motion.div>
    </div>
  );
}