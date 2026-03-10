import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaChevronDown, FaTimes, FaFilter } from "react-icons/fa";

const tipos = [
  "Player", "Fan", "Mujer", "Niño", "Retro",
  "Abrigos", "Nacional", "Balón", "Ofertas",
  "NBA", "MLB", "Todos",
];

const tallas = [
  "16", "18", "20", "22", "24", "26", "28",
  "S", "M", "L", "XL", "XXL", "3XL", "4XL"
];

const tallasCRC = {
  "16": "2", "18": "4", "20": "6", "22": "8",
  "24": "10", "26": "12", "28": "14"
};

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterSizes,
  setFilterSizes
}) {
  const [showTipos, setShowTipos] = useState(false);
  const [showTallas, setShowTallas] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const tiposRef = useRef(null);
  const tallasRef = useRef(null);
  const isDisponibles = window.__verDisponiblesActivo === true;

  useEffect(() => {
    const timeout = setTimeout(() => { setSearchTerm(localSearch); }, 250);
    return () => clearTimeout(timeout);
  }, [localSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tiposRef.current && !tiposRef.current.contains(event.target)) setShowTipos(false);
      if (tallasRef.current && !tallasRef.current.contains(event.target)) setShowTallas(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tipoLabel = isDisponibles ? "Disponibles" : (filterType || "Categoría"); 

  const handleClear = () => {
    setLocalSearch("");
    setFilterSizes([]);
    if (!isDisponibles) setFilterType("");
  };

  const handleTipoClick = (t) => {
    if (isDisponibles) delete window.__verDisponiblesActivo;
    setFilterType(t === "Todos" ? "" : t);
    setShowTipos(false);
  };

  return (
    <div className="mb-8 mt-4 w-full sticky top-[70px] z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row gap-4 items-center">
        
        {/* 🔍 BÚSQUEDA PRO */}
        <div className="relative w-full lg:w-96 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 group-focus-within:text-fiebriVerde transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar tu camiseta favorita..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-fiebriGris border-2 border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-fiebriVerde focus:ring-4 focus:ring-fiebriVerde/10 transition-all"
          />
        </div>

        {/* 🔽 FILTROS CON ESTILO DE MARCA */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto ml-auto">
          
          <div className="flex items-center gap-2 px-3 py-2 bg-fiebriAzul/5 rounded-xl mr-2">
            <FaFilter className="text-fiebriAzul text-xs" />
            <span className="text-[10px] font-black text-fiebriAzul uppercase tracking-tighter">Filtros</span>
          </div>

          {/* Selector de Categoría */}
          <div className="relative" ref={tiposRef}>
            <button
              onClick={() => { setShowTipos(!showTipos); setShowTallas(false); }}
              className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all border-2
                ${filterType || isDisponibles 
                  ? "bg-fiebriAzul text-white border-fiebriAzul shadow-lg shadow-fiebriAzul/20" 
                  : "bg-white text-gray-600 border-gray-100 hover:border-fiebriAzul/30"}`}
            >
              {tipoLabel}
              <FaChevronDown className={`text-[10px] transition-transform ${showTipos ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showTipos && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
                >
                  {tipos.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTipoClick(t)}
                      className="w-full px-5 py-2.5 text-left text-sm font-semibold hover:bg-fiebriGris hover:text-fiebriVerde transition-colors flex items-center justify-between"
                    >
                      {t}
                      {filterType === t && <div className="w-2 h-2 bg-fiebriVerde rounded-full" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selector de Tallas */}
          <div className="relative" ref={tallasRef}>
            <button
              onClick={() => { setShowTallas(!showTallas); setShowTipos(false); }}
              className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all border-2
                ${filterSizes.length > 0 
                  ? "bg-fiebriVerde text-fiebriAzul border-fiebriVerde shadow-lg shadow-fiebriVerde/20" 
                  : "bg-white text-gray-600 border-gray-100 hover:border-fiebriVerde/30"}`}
            >
              {filterSizes.length > 0 ? `Tallas (${filterSizes.length})` : "Tallas"}
              <FaChevronDown className={`text-[10px] transition-transform ${showTallas ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showTallas && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-4 right-0 md:left-0"
                >
                  <p className="text-[10px] font-black text-gray-300 uppercase mb-3 tracking-widest">Selecciona tus tallas</p>
                  <div className="grid grid-cols-3 gap-2">
                    {tallas.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setFilterSizes(filterSizes.includes(t) ? filterSizes.filter((s) => s !== t) : [...filterSizes, t]);
                        }}
                        className={`py-2 text-[11px] font-black rounded-lg border-2 transition-all
                          ${filterSizes.includes(t)
                            ? "bg-fiebriVerde border-fiebriVerde text-fiebriAzul shadow-sm"
                            : "bg-fiebriGris border-transparent text-gray-500 hover:border-fiebriVerde/30"}`}
                      >
                        {t} {tallasCRC[t] && <span className="opacity-40">({tallasCRC[t]})</span>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ❌ LIMPIAR */}
          {(localSearch || filterType || filterSizes.length > 0) && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onClick={handleClear}
              className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              title="Limpiar filtros"
            >
              <FaTimes />
            </motion.button>
          )}

        </div>
      </div>
    </div>
  );
}