import { motion } from "framer-motion";
import { FaFutbol, FaTag } from "react-icons/fa";
import tallaPorTipo from "../utils/tallaPorTipo";

// 🔽 Helper para Cloudinary
const cldUrl = (url, w, h) => {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace(
    /\/upload\/(?!.*(f_auto|q_auto|w_|h_))/,
    `/upload/f_auto,q_auto:eco,c_fill,g_auto,e_sharpen:60,w_${w},h_${h}/`
  );
};

export default function ProductCard({ product, onClick, canEdit }) {
  const H = 700;

  const imgMain = Array.isArray(product.images) && product.images.length > 0
      ? cldUrl(typeof product.images[0] === "string" ? product.images[0] : product.images[0]?.url, 640, H)
      : product.imageSrc || null;

  const imgHover = Array.isArray(product.images) && product.images.length > 1
      ? cldUrl(typeof product.images[1] === "string" ? product.images[1] : product.images[1]?.url, 640, H)
      : null;

  const hasDiscount = Number(product.discountPrice) > 0;
  const isNew = Boolean(product.isNew);
  
  const stock = product.stock || {};
  const totalStock = Object.values(stock).reduce((acc, qty) => acc + (Number(qty) || 0), 0);
  const isOutOfStock = totalStock <= 0;

  const tallasOficiales = tallaPorTipo[product.type] || [];
  
  const tallasFaltantes = tallasOficiales.filter(talla => {
    const cantidad = Number(stock[talla]) || 0;
    return cantidad <= 0;
  });

  const reporteAgotadas = tallasFaltantes.map(t => t.toUpperCase()).join(" - ");

  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-fiebriAzul/10 transition-all duration-500 cursor-pointer w-full border border-gray-100 flex flex-col"
      onClick={() => onClick(product)}
    >
      
      {/* SECCIÓN DE IMAGEN */}
      <div className="relative w-full aspect-[4/5] bg-fiebriGris overflow-hidden">
        {isOutOfStock && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-fiebriAzul/30 backdrop-blur-[3px]">
            <span className="bg-white text-fiebriAzul font-black uppercase tracking-widest text-[8px] sm:text-[10px] px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl shadow-2xl rotate-[-10deg] border-2 border-fiebriAzul">
              Agotado
            </span>
          </div>
        )}

        {/* Etiqueta Nuevo - Escalada para móvil */}
        {!isOutOfStock && isNew && (
          <div className="sticker-new z-20 scale-75 origin-top-left sm:scale-100">
            <span>Nuevo</span>
          </div>
        )}

        {/* Etiqueta Oferta - Ajustada para móvil */}
        {!isOutOfStock && hasDiscount && (
          <div className="absolute top-2 sm:top-4 right-0 sm:-right-0 z-20 scale-75 origin-top-right sm:scale-100">
            <span className="etiqueta-oferta-fiebri flex items-center gap-1 sm:gap-1.5 shadow-xl">
              <FaTag className="text-[8px] sm:text-[10px]" /> OFERTA
            </span>
          </div>
        )}

        <div className="w-full h-full relative">
          {imgMain ? (
            <>
              <img src={imgMain} alt={product.name} className={`w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 ${imgHover && !isOutOfStock ? "group-hover:opacity-0" : ""} ${isOutOfStock ? "brightness-75" : ""}`} loading="lazy" />
              {imgHover && !isOutOfStock && <img src={imgHover} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110" loading="lazy" />}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <FaFutbol className="text-3xl sm:text-4xl mb-2 opacity-20" />
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Sin foto</span>
            </div>
          )}
        </div>
      </div>

      {/* INFORMACIÓN */}
      <div className="flex flex-col flex-grow">
        {product.type && (
          <div className="w-full bg-fiebriAzul py-1 sm:py-1.5 text-center">
            <span className="text-[7px] sm:text-[9px] font-black text-white uppercase tracking-[0.2em]">{product.type}</span>
          </div>
        )}

        {/* Ajuste de padding para móvil */}
        <div className="p-3 sm:p-5 flex flex-col justify-between flex-grow">
          
          {/* Nombre más pequeño en móvil */}
          <h3 className="text-xs sm:text-sm font-black text-fiebriAzul uppercase italic tracking-tighter leading-tight line-clamp-2 min-h-[2.8em] group-hover:text-fiebriVerde transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-2 sm:mt-4">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 line-through">₡{Number(product.price).toLocaleString("de-DE")}</span>
                  <span className="text-sm sm:text-xl font-black text-fiebriVerde italic">₡{Number(product.discountPrice).toLocaleString("de-DE")}</span>
                </>
              ) : (
                <span className="text-sm sm:text-xl font-black text-fiebriAzul italic">₡{Number(product.price).toLocaleString("de-DE")}</span>
              )}
            </div>
            {/* Ícono de pelota más pequeño en móvil */}
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-fiebriGris flex items-center justify-center group-hover:bg-fiebriVerde transition-colors">
              <FaFutbol className="text-gray-300 group-hover:text-fiebriAzul text-[10px] sm:text-sm transition-colors" />
            </div>
          </div>
        </div>

        {/* 🛡️ INFO ADMIN */}
        {canEdit && (
          <div className="bg-fiebriGris/50 px-3 sm:px-5 py-2 sm:py-3 border-t border-gray-100 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
             {isOutOfStock ? (
               <div className="text-red-600 flex items-center gap-1.5 sm:gap-2">
                 <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" /> PRODUCTO AGOTADO TOTAL
               </div>
             ) : (
               <div className="flex flex-col gap-0.5 sm:gap-1">
                 <div className="text-fiebriAzul flex items-center gap-1.5 sm:gap-2">
                   <div className="w-1.5 h-1.5 bg-fiebriVerde rounded-full" /> STOCK TOTAL: {totalStock}
                 </div>
                 
                 {tallasFaltantes.length > 0 ? (
                   <div className="text-red-500 font-black italic mt-0.5 sm:mt-1 leading-relaxed">
                     AGOTADO EN TALLA: {reporteAgotadas}
                   </div>
                 ) : (
                   <div className="text-fiebriVerde font-bold mt-0.5 sm:mt-1">
                     ✅ TODAS LAS TALLAS DISPONIBLES
                   </div>
                 )}
               </div>
             )}
          </div>
        )}
      </div>
    </motion.div>
  );
}