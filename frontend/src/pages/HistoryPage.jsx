import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaHistory, FaTrash, FaUser, FaCalendarAlt, FaArrowLeft, FaSearch, FaFutbol } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

// ✅ Usamos la variable de entorno para la API
const API_BASE = import.meta.env.VITE_API_URL || "https://fiebriticos.onrender.com";

export default function HistoryPage({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); 
  const navigate = useNavigate();

  const isSuperUser = user?.isSuperUser || false;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const roles = Array.isArray(user?.roles) ? user.roles.join(",") : "";
      const params = new URLSearchParams({
        page: "1",
        limit: "1000",
        ...(selectedDate && { date: selectedDate }),
        _: String(Date.now()), 
      });

      const res = await fetch(`${API_BASE}/api/history?` + params.toString(), {
        headers: {
          "Content-Type": "application/json",
          "x-super": isSuperUser ? "true" : "false",
          "x-roles": roles,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setLogs(items);
    } catch (e) {
      console.error(e);
      toast.error("Error al sincronizar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]); 

  const handleClear = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar TODO el historial?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/history`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-super": isSuperUser ? "true" : "false" },
      });
      if (!res.ok) throw new Error();
      toast.success("Historial limpiado correctamente.");
      setLogs([]);
    } catch {
      toast.error("Error al limpiar.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((log) => 
      String(log.item || log.productName || "").toLowerCase().includes(term) ||
      String(log.user || "").toLowerCase().includes(term) ||
      String(log.action || "").toLowerCase().includes(term)
    );
  }, [logs, q]);

  return (
    <div className="min-h-screen bg-fiebriGris flex flex-col font-poppins">
      <div className="flex-grow pt-32 sm:pt-40 px-4 md:px-8 max-w-6xl mx-auto w-full box-border">
        
        {/* BOTÓN VOLVER */}
        <div className="flex justify-start mb-8">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-fiebriAzul border border-gray-200 rounded-2xl hover:bg-fiebriAzul hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
            >
                <FaArrowLeft /> Regresar
            </button>
        </div>

        {/* HEADER Y FILTROS */}
        <div className="flex flex-col mb-10 gap-8">
          <div className="flex items-center gap-4">
            <div className="bg-fiebriAzul p-4 rounded-[1.5rem] shadow-xl shadow-fiebriAzul/20">
                <FaHistory className="text-fiebriVerde text-2xl" />
            </div>
            <div>
                <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-fiebriAzul">Historial de  <span className="text-fiebriVerde text-shadow-sm">cambios</span></h1>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Control de movimientos</p>
            </div>
          </div>

          {/* FILTROS RESPONSIVOS */}
          <div className="flex flex-col gap-4 w-full bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            
            {/* Buscador */}
            <div className="relative w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="Buscar por equipo, admin o acción..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-fiebriGris border-none rounded-2xl pl-12 pr-4 py-4 text-sm text-fiebriAzul font-bold outline-none focus:ring-2 focus:ring-fiebriVerde transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-grow bg-fiebriGris border-none rounded-2xl px-5 py-4 text-sm text-fiebriAzul font-black outline-none focus:ring-2 focus:ring-fiebriAzul cursor-pointer"
                />

                {isSuperUser && (
                    <button 
                        onClick={handleClear} 
                        className="w-full sm:w-auto bg-red-50 text-red-500 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 border-2 border-red-100"
                    >
                        Limpiar Historial
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* LISTADO */}
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center">
             <FaFutbol className="text-fiebriAzul/20 text-5xl animate-spin mb-4" />
             <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Sincronizando con el servidor...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 px-6">
            <FaHistory className="text-gray-200 text-6xl mx-auto mb-6" />
            <p className="text-fiebriAzul font-black uppercase tracking-widest text-sm">
              {selectedDate ? `No hay jugadas registradas el ${new Date(selectedDate).toLocaleDateString()}` : "Sin actividad en la bitácora"}
            </p>
            {selectedDate && (
                <button onClick={() => setSelectedDate("")} className="mt-6 text-fiebriVerde text-[11px] font-black uppercase tracking-widest hover:underline">Ver historial completo</button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6 mb-24">
            {filteredLogs.map((log, idx) => (
              <div key={log._id || idx} className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-fiebriAzul/5 transition-all group relative overflow-hidden">
                
                {/* Indicador de acción lateral */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${log.action?.toLowerCase().includes('eliminar') ? 'bg-red-500' : 'bg-fiebriVerde'}`} />

                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-fiebriGris rounded-xl flex items-center justify-center text-fiebriAzul flex-shrink-0 group-hover:bg-fiebriAzul group-hover:text-white transition-colors">
                            <FaUser size={14} />
                        </div>
                        <div>
                            <p className="font-black uppercase text-[11px] tracking-tight text-fiebriAzul">
                                {log.user}
                            </p>
                            <span className="text-[9px] font-black uppercase tracking-widest text-fiebriVerde bg-fiebriVerde/5 px-2 py-0.5 rounded-full">
                                {log.action}
                            </span>
                        </div>
                    </div>
                    {/* 👇 SE MUESTRA EL ID COMO REFERENCIA 👇 */}
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-gray-300 bg-fiebriGris px-3 py-1 rounded-full uppercase tracking-tighter">
                        REF: {log.productId?.substring(0,8) || log._id?.substring(18)}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-fiebriAzul font-black text-2xl sm:text-3xl italic uppercase tracking-tighter leading-tight group-hover:text-fiebriVerde transition-colors">
                    {log.item || log.productName}
                  </h2>

                  <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    <FaCalendarAlt className="text-fiebriVerde" /> 
                    {log.date ? new Date(log.date).toLocaleString() : new Date(log.createdAt).toLocaleString()}
                  </div>
                  
                  {/* 👇 EL TEXTO DEL HISTORIAL SALE DIRECTO, SIN BOTONES OCULTOS 👇 */}
                  {log.details && (
                    <div className="mt-2 bg-fiebriGris p-5 rounded-2xl border border-gray-100 overflow-hidden">
                      <p className="text-[12px] sm:text-sm text-fiebriAzul/80 font-bold leading-relaxed">
                        {typeof log.details === "string" ? log.details : JSON.stringify(log.details, null, 2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}