import { motion } from "framer-motion";
import { FaFutbol, FaTag } from "react-icons/fa";

// 🔽 Helper para Cloudinary (Optimización Pro)
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

  // 1. IMAGEN PRINCIPAL
  const imgMain =
    Array.isArray(product.images) && product.images.length > 0
      ? cldUrl(
          typeof product.images[0] === "string"
            ? product.images[0]
            : product.images[0]?.url,
          640,
          H
        )
      : product.imageSrc || null;

  // 2. IMAGEN HOVER
  const imgHover =
    Array.isArray(product.images) && product.images.length > 1
      ? cldUrl(
          typeof product.images[1] === "string"
            ? product.images[1]
            : product.images[1]?.url,
          640,
          H
        )
      : null;

  const hasDiscount = Number(product.discountPrice) > 0;
  const isNew = Boolean(product.isNew);
  const totalStock = Object.values(product.stock || {}).reduce((acc, qty) => acc + (Number(qty) || 0), 0);
  const isOutOfStock = totalStock <= 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-fiebriAzul/10 transition-all duration-500 cursor-pointer w-full border border-gray-100 flex flex-col"
      onClick={() => onClick(product)}
    >
      
      {/* ===========================
          📸 SECCIÓN DE IMAGEN 
      =========================== */}
      <div className="relative w-full aspect-[4/5] bg-fiebriGris overflow-hidden">
        
        {/* Agotado Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-fiebriAzul/40 backdrop-blur-sm">
            <span className="bg-white text-fiebriAzul font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl shadow-2xl rotate-[-10deg] border-2 border-fiebriAzul">
              Agotado
            </span>
          </div>
        )}

        {/* Sticker NUEVO - Usa la clase de index.css */}
        {!isOutOfStock && isNew && (
          <div className="sticker-new z-20">
            <span>Nuevo</span>
          </div>
        )}

        {/* Etiqueta OFERTA */}
        {!isOutOfStock && hasDiscount && (
          <div className="absolute top-4 right-4 z-20">
            <span className="etiqueta-oferta-fiebri flex items-center gap-1.5 shadow-xl">
              <FaTag className="text-[10px]" />
              OFERTA
            </span>
          </div>
        )}

        {/* Imágenes con Efecto Swap */}
        <div className="w-full h-full relative">
          {imgMain ? (
            <>
              <img
                src={imgMain}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110 ${
                  imgHover && !isOutOfStock ? "group-hover:opacity-0" : "" 
                } ${isOutOfStock ? "opacity-40 grayscale" : ""}`}
                loading="lazy"
              />
              {imgHover && !isOutOfStock && (
                <img
                  src={imgHover}
                  alt={`${product.name} vista`}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <FaFutbol className="text-4xl mb-2 opacity-20" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sin foto</span>
            </div>
          )}
        </div>
      </div>

      {/* ===========================
          📝 INFORMACIÓN 
      =========================== */}
      <div className="flex flex-col flex-grow">
        
        {/* Badge de Categoría (Azul Fiebriticos) */}
        {product.type && (
          <div className="w-full bg-fiebriAzul py-1.5 text-center">
            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
              {product.type}
            </span>
          </div>
        )}

        <div className="p-5 flex flex-col justify-between flex-grow">
          {/* Nombre con tipografía deportiva */}
          <h3 className="text-sm font-black text-fiebriAzul uppercase italic tracking-tighter leading-tight line-clamp-2 min-h-[2.8em] group-hover:text-fiebriVerde transition-colors">
            {product.name}
          </h3>

          {/* Sección de Precios */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className="text-[10px] font-bold text-gray-400 line-through decoration-fiebriVerde/50">
                    ₡{Number(product.price).toLocaleString("de-DE")}
                  </span>
                  <span className="text-xl font-black text-fiebriVerde tracking-tighter italic">
                    ₡{Number(product.discountPrice).toLocaleString("de-DE")}
                  </span>
                </>
              ) : (
                <span className="text-xl font-black text-fiebriAzul tracking-tighter italic">
                  ₡{Number(product.price).toLocaleString("de-DE")}
                </span>
              )}
            </div>
            
            {/* Indicador visual de stock rápido */}
            <div className="h-8 w-8 rounded-full bg-fiebriGris flex items-center justify-center group-hover:bg-fiebriVerde transition-colors">
              <FaFutbol className="text-gray-300 group-hover:text-fiebriAzul text-sm transition-colors" />
            </div>
          </div>
        </div>

        {/* Info Admin - Estilo reporte */}
        {canEdit && (
          <div className="bg-fiebriGris/50 px-5 py-3 border-t border-gray-100 text-[9px] font-black uppercase tracking-widest">
             {isOutOfStock ? (
               <p className="text-red-500 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Sin existencias
               </p>
             ) : (
               <p className="text-fiebriAzul flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-fiebriVerde rounded-full" /> Gestión Activa
               </p>
             )}
          </div>
        )}
      </div>
    </motion.div>
  );
}