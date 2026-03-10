import { FaSearch, FaFilter } from "react-icons/fa";

export default function FilterBar({ searchTerm, setSearchTerm, filterType, setFilterType }) {
  const categories = ["Todos", "Player", "Fan", "Retro", "Nacional", "Ofertas"];

  return (
    <div className="sticky top-[80px] sm:top-[100px] z-40 bg-white/70 backdrop-blur-xl py-6 px-4 mb-10 border-b border-fiebriGris shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6">
        
        {/* 🔍 Buscador Estilo "Cancha" */}
        <div className="relative w-full lg:w-1/3 group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-fiebriAzul transition-colors" />
          <input
            type="text"
            placeholder="Busca tu camiseta favorita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-fiebriGris/50 border-2 border-transparent rounded-2xl pl-14 pr-6 py-4 shadow-inner focus:bg-white focus:border-fiebriAzul/30 focus:ring-4 focus:ring-fiebriAzul/5 outline-none transition-all font-semibold text-fiebriAzul placeholder:text-gray-400"
          />
        </div>

        {/* 📋 Selector de Tácticas (Categorías) */}
        <div className="flex items-center gap-2 w-full lg:flex-1 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {/* Badge de Filtros */}
          <div className="flex items-center gap-2 bg-fiebriAzul text-fiebriVerde px-4 py-3 rounded-2xl shadow-lg shadow-fiebriAzul/20 mr-2 shrink-0">
            <FaFilter className="text-[10px]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Filtros</span>
          </div>
          
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat === "Todos" ? "" : cat)}
              className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap active:scale-90
                ${(filterType === cat || (cat === "Todos" && !filterType)) 
                  ? "bg-fiebriVerde text-fiebriAzul shadow-xl shadow-fiebriVerde/30 scale-105 border-b-4 border-fiebriAzul/20" 
                  : "bg-white text-gray-400 hover:text-fiebriAzul hover:bg-fiebriAzul/5 border-2 border-fiebriGris"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}