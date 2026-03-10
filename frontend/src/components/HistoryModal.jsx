import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaHistory, FaTrash, FaUser, FaCalendarAlt, FaArrowLeft, FaSearch, FaFutbol } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const API_BASE = import.meta.env.VITE_API_BASE || "https://fiebriticos.onrender.com";

/* --- Utilidades de fecha --- */
function pad2(n) { return n < 10 ? `0${n}` : `${n}`; }
function ymdLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${y}-${m}-${dd}`;
}

export default function HistoryPage({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => ymdLocal());
  const navigate = useNavigate();

  const isSuperUser = user?.isSuperUser || false;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const roles = Array.isArray(user?.roles) ? user.roles.join(",") : "";
      const params = new URLSearchParams({
        page: "1",
        limit: "500",
        date: selectedDate,
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
      toast.error("No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDate, user]);

  const handleClear = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar TODO el historial? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/history`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "x-super": isSuperUser ? "true" : "false"
        },
      });
      if (!res.ok) throw new Error();
      toast.success("Historial limpiado correctamente.");
      setLogs([]);
    } catch {
      toast.error("Error al intentar limpiar el historial.");
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
      <div className="flex-grow pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto w-full">
        
        {/* BOTÓN VOLVER - Estilo Fiebriticos */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-fiebriAzul border border-gray-200 rounded-2xl hover:bg-fiebriAzul hover:text-white transition-all shadow-sm font-bold text-sm mb-8 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
          Regresar al Panel
        </button>

        {/* HEADER DE PÁGINA */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-fiebriAzul rounded-2xl shadow-lg shadow-fiebriAzul/20">
                <FaHistory className="text-fiebriVerde text-2xl" />
              </div>
              <h1 className="text-4xl font-black text-fiebriAzul tracking-tighter uppercase italic">
                Bitácora <span className="text-fiebriVerde">Pro</span>
              </h1>
            </div>
            <p className="text-gray-400 font-medium ml-1">Control total de movimientos del inventario.</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* BUSCADOR ELEGANTE */}
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por producto o admin..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-white border-2 border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-fiebriAzul outline-none shadow-sm transition-all"
              />
            </div>

            {/* FILTRO FECHA */}
            <div className="relative">
               <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border-2 border-transparent rounded-2xl px-5 py-3 text-sm text-fiebriAzul font-black outline-none shadow-sm focus:border-fiebriVerde transition-all cursor-pointer"
              />
            </div>

            {isSuperUser && (
              <button 
                onClick={handleClear} 
                className="bg-red-50 text-red-500 border-2 border-red-100 px-6 py-3 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95 uppercase tracking-widest"
              >
                Limpiar Todo
              </button>
            )}
          </div>
        </div>

        {/* LISTADO DE LOGS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
             <FaFutbol className="text-fiebriAzul text-5xl animate-spin mb-4 opacity-20" />
             <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Consultando el VAR...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 shadow-inner">
            <div className="w-20 h-20 bg-fiebriGris rounded-full flex items-center justify-center mx-auto mb-6">
               <FaHistory className="text-gray-300 text-3xl" />
            </div>
            <p className="text-fiebriAzul font-black uppercase tracking-widest text-sm">
              {q ? "No se encontraron coincidencias" : "Sin movimientos registrados para hoy"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 mb-24">
            {filteredLogs.map((log, idx) => (
              <div 
                key={log._id || idx} 
                className="bg-white border border-gray-100 p-6 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:shadow-fiebriAzul/5 transition-all group relative overflow-hidden"
              >
                {/* Indicador de acción lateral */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${log.action?.includes('Eliminar') ? 'bg-red-500' : 'bg-fiebriVerde'}`} />

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-14 h-14 bg-fiebriGris rounded-2xl flex items-center justify-center border border-gray-100 text-fiebriAzul group-hover:bg-fiebriAzul group-hover:text-white transition-all flex-shrink-0 shadow-inner">
                    <FaUser size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                      <span className="font-black text-fiebriAzul uppercase text-sm tracking-tight">{log.user}</span>
                      <span className="px-3 py-1 bg-fiebriAzul/5 text-fiebriAzul text-[10px] font-black rounded-full uppercase tracking-wider">
                        {log.action}
                      </span>
                    </div>
                    
                    <h3 className="text-fiebriAzul font-black text-2xl italic uppercase tracking-tighter leading-tight">
                      {log.item || log.productName}
                    </h3>

                    <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-fiebriVerde" /> 
                        {log.date ? new Date(log.date).toLocaleString() : new Date(log.createdAt).toLocaleString()}
                      </span>
                      <span className="hidden sm:block opacity-30">|</span>
                      <span className="hidden sm:block">REF ID: {log._id?.substring(18)}</span>
                    </div>
                    
                    {log.details && (
                      <details className="mt-4 group/details">
                        <summary className="text-[10px] font-black text-fiebriVerde cursor-pointer uppercase tracking-widest list-none hover:underline">
                          Ver detalles técnicos [+]
                        </summary>
                        <div className="mt-3 bg-fiebriGris rounded-xl p-4 border border-gray-100">
                          <pre className="text-[11px] text-fiebriAzul/70 font-mono overflow-x-auto whitespace-pre-wrap">
                            {typeof log.details === "string" ? log.details : JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
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