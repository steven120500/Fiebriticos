import { useState, useRef, useEffect } from "react";
import { FaSearch, FaChevronDown, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function FilterBar({ 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType, 
  filterSizes = [], 
  setFilterSizes 
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // 🔹 Todos los tipos del catálogo
  const categories = [
    "Todos", "Player", "Fan", "Mujer", "Niño", "Retro", "Abrigos", "Nacional", "Balón", "Ofertas"
  ];
  
  // 🔹 Todas las tallas (Niños, Adultos y Balones)
  const sizes = [
    "18", "20", "22", "24", "26", "28", // Niños
    "S", "M", "L", "XL", "2XL", "3XL", "4XL", // Adultos
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSize = (size) => {
    if (!setFilterSizes) return;
    if (filterSizes.includes(size)) {
      setFilterSizes(filterSizes.filter((s) => s !== size));
    } else {
      setFilterSizes([...filterSizes, size]);
    }
  };

  const handleClearFilters = () => {
    setFilterType("");
    setFilterSizes([]);
    setSearchTerm("");
    setOpenDropdown(null);
  };

  const hasActiveFilters = filterType || filterSizes?.length > 0 || searchTerm;

  return (
    <div className="sticky top-[80px] sm:top-[100px] z-40 bg-white/90 backdrop-blur-xl py-4 px-4 mb-10 border-b border-fiebriGris shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* 🔍 BUSCADOR ESTILO "CANCHA" */}
        <div className="relative w-full lg:max-w-md group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-fiebriAzul transition-colors" />
          <input
            type="text"
            placeholder="Busca tu camiseta favorita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-fiebriGris rounded-[2rem] pl-12 pr-6 py-3 focus:bg-white focus:border-fiebriAzul/30 focus:ring-4 focus:ring-fiebriAzul/5 outline-none transition-all font-semibold text-fiebriAzul placeholder:text-gray-400 shadow-sm"
          />
        </div>

        {/* 📋 SELECTORES Y LIMPIAR FILTROS */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto" ref={dropdownRef}>
          
          <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">
            FILTRAR:
          </span>

          {/* 🔽 DROPDOWN VERSIÓN (TIPO) */}
          <div className="relative shrink-0">
            <button
              onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
              // 👇 AQUÍ AJUSTAMOS LOS COLORES AL ESTAR ACTIVO 👇
              className={`flex items-center justify-between gap-3 px-6 py-3 rounded-[2rem] text-xs font-bold transition-all border-2
                ${openDropdown === "type" || filterType 
                  ? "bg-fiebriAzul text-white border-transparent shadow-md" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-fiebriAzul/30 shadow-sm"
                }`}
            >
              <span>{filterType || "Versión"}</span>
              <FaChevronDown className={`text-[10px] transition-transform duration-300 ${openDropdown === "type" ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {openDropdown === "type" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white border-2 border-fiebriGris rounded-2xl shadow-2xl p-2 z-50 overflow-y-auto max-h-60 scroll-custom"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setFilterType(cat === "Todos" ? "" : cat);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-colors flex justify-between items-center
                        ${(filterType === cat || (cat === "Todos" && !filterType))
                          ? "bg-fiebriAzul text-white font-bold"
                          : "text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                      {cat}
                      {(filterType === cat || (cat === "Todos" && !filterType)) && <FaCheck className="text-white text-[10px]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🔽 DROPDOWN TALLAS */}
          <div className="relative shrink-0">
            <button
              onClick={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
              // 👇 AQUÍ AJUSTAMOS LOS COLORES AL ESTAR ACTIVO 👇
              className={`flex items-center justify-between gap-3 px-6 py-3 rounded-[2rem] text-xs font-bold transition-all border-2
                ${openDropdown === "size" || filterSizes?.length > 0 
                  ? "bg-fiebriAzul text-white border-transparent shadow-md" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-fiebriAzul/30 shadow-sm"
                }`}
            >
              <span>{filterSizes?.length > 0 ? `Tallas (${filterSizes.length})` : "Tallas"}</span>
              <FaChevronDown className={`text-[10px] transition-transform duration-300 ${openDropdown === "size" ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {openDropdown === "size" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 sm:left-0 mt-2 w-[280px] sm:w-[320px] bg-white border-2 border-fiebriGris rounded-2xl shadow-2xl p-4 z-50"
                >
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">Selecciona las tallas</p>
                  
                  {/* Grid de Tallas con scroll si son muchas */}
                  <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1 scroll-custom">
                    {sizes.map((size) => {
                      const isSelected = filterSizes?.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`py-2 rounded-xl text-xs font-black transition-all border-2
                            ${isSelected 
                              ? "bg-fiebriAzul border-fiebriAzul text-white shadow-md" 
                              : "bg-white border-gray-200 text-gray-500 hover:border-fiebriVerde hover:text-fiebriAzul"
                            }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ❌ BOTÓN LIMPIAR */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.8, width: 0 }}
                onClick={handleClearFilters}
                className="shrink-0 bg-red-600 text-white px-6 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center overflow-hidden whitespace-nowrap"
              >
                Limpiar
              </motion.button>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}