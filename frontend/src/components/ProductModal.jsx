import { useEffect, useRef, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { FaWhatsapp, FaTimes, FaChevronLeft, FaChevronRight, FaEdit, FaTrashAlt, FaFutbol, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || "https://fiebriticos.onrender.com";

const TALLAS_ADULTO = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const TALLAS_NINO   = ['16', '18', '20', '22', '24', '26', '28'];
const TALLAS_BALON  = ['3', '4', '5'];
const ACCEPTED_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/heic', 'image/webp'];

const MODAL_IMG_MAX_W = 800;

function transformCloudinary(url, maxW) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('res.cloudinary.com')) return url;
    const parts = u.pathname.split('/upload/');
    if (parts.length < 2) return url;
    const transforms = `f_auto,q_auto:eco,c_limit,w_${maxW},dpr_auto`;
    u.pathname = `${parts[0]}/upload/${transforms}/${parts[1]}`;
    return u.toString();
  } catch { return url; }
}

export default function ProductModal({ product, onClose, onUpdate, canEdit, canDelete, user }) {
  const modalRef = useRef(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [viewProduct, setViewProduct] = useState(product);
  const [isEditing, setIsEditing] = useState(false);

  const [editedStock, setEditedStock] = useState(product.stock || {});
  const [editedName, setEditedName] = useState(product?.name || '');
  const [editedPrice, setEditedPrice] = useState(product?.price ?? 0);
  const [editedDiscountPrice, setEditedDiscountPrice] = useState(product?.discountPrice ?? '');
  const [editedType, setEditedType] = useState(product?.type || 'Player');
  const [editedIsNew, setEditedIsNew] = useState(Boolean(product?.isNew));
  const [loading, setLoading] = useState(false);

  const galleryFromProduct = useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images.map(i => (typeof i === 'string' ? i : i?.url)).filter(Boolean);
    }
    return [product?.imageSrc, product?.imageSrc2].filter(Boolean);
  }, [product]);

  const [localImages, setLocalImages] = useState(galleryFromProduct.map(src => ({ src, isNew: false })));
  const [idx, setIdx] = useState(0);
  const currentSrc = localImages[idx]?.src || '';

  useEffect(() => {
    setViewProduct(product);
    setEditedName(product?.name || '');
    setEditedPrice(product?.price ?? 0);
    setEditedDiscountPrice(product?.discountPrice ?? '');
    setEditedType(product?.type || 'Player');
    setEditedStock({ ...(product?.stock || {}) });
    setEditedIsNew(Boolean(product?.isNew));
    setLocalImages(galleryFromProduct.map(src => ({ src, isNew: false })));
    setIdx(0);
  }, [product, galleryFromProduct]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleSave = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const displayName = user?.username || 'Fiebriticos';
      const payload = {
        name: editedName.trim(),
        price: parseInt(editedPrice, 10),
        discountPrice: editedDiscountPrice !== '' ? parseInt(editedDiscountPrice, 10) : null,
        type: editedType,
        stock: editedStock,
        images: localImages.map(i => i.src),
        isNew: editedIsNew
      };

      const res = await fetch(`${API_BASE}/api/products/${product._id || product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user': displayName },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();
      setViewProduct(updated);
      onUpdate?.(updated);
      setIsEditing(false);
      toast.success('¡Inventario actualizado!');
    } catch { toast.error('Error al actualizar'); } finally { setLoading(false); }
  };

  const executeDelete = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products/${product._id || product.id}`, {
        method: 'DELETE',
        headers: { 'x-user': user?.username || 'Fiebriticos' },
      });
      if (!res.ok) throw new Error();
      toast.success('Producto eliminado');
      onUpdate?.(null, product._id || product.id);
      onClose();
    } catch { toast.error('Error al eliminar'); } finally { setLoading(false); }
  };

  const tallasVisibles = (isEditing ? editedType : viewProduct?.type) === 'Balón' ? TALLAS_BALON : (isEditing ? editedType : viewProduct?.type) === 'Niño' ? TALLAS_NINO : TALLAS_ADULTO;
  const displayUrl = currentSrc ? transformCloudinary(currentSrc, MODAL_IMG_MAX_W) : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-fiebriAzul/60 backdrop-blur-md p-4 overflow-y-auto" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border-b-8 border-fiebriVerde my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Visual */}
        <div className="bg-fiebriAzul p-8 text-center relative overflow-hidden">
          <FaFutbol className="absolute -top-4 -left-4 text-white/5 text-8xl rotate-12" />
          <button onClick={onClose} className="absolute right-6 top-6 text-white/50 hover:text-fiebriVerde transition-all hover:rotate-90">
            <FaTimes size={24} />
          </button>
          
          <span className="bg-fiebriVerde text-fiebriAzul text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block shadow-lg">
            {isEditing ? 'Modo Edición' : (viewProduct?.type || 'Detalle')}
          </span>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-tight px-4">
            {isEditing ? 'Ajustar Producto' : viewProduct?.name}
          </h2>
        </div>

        <div className="p-8">
          {/* Vista Galería */}
          {!isEditing ? (
            <div className="relative group rounded-[2rem] bg-fiebriGris overflow-hidden mb-8 shadow-inner aspect-square flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={displayUrl} src={displayUrl} alt={viewProduct?.name}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="max-h-full max-w-full object-contain p-4"
                />
              </AnimatePresence>
              {localImages.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setIdx((idx - 1 + localImages.length) % localImages.length)} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-fiebriVerde hover:text-fiebriAzul transition-all shadow-xl">
                    <FaChevronLeft />
                  </button>
                  <button onClick={() => setIdx((idx + 1) % localImages.length)} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-fiebriVerde hover:text-fiebriAzul transition-all shadow-xl">
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 mb-8 bg-fiebriGris p-6 rounded-[2rem] border border-gray-100 shadow-inner">
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Nombre del Producto</label>
                  <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full bg-white rounded-2xl px-5 py-3 text-sm font-bold text-fiebriAzul border-none focus:ring-2 focus:ring-fiebriVerde shadow-sm" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Precio Normal</label>
                    <input type="number" value={editedPrice} onChange={(e) => setEditedPrice(e.target.value)} className="w-full bg-white rounded-2xl px-5 py-3 text-sm font-bold text-fiebriAzul border-none focus:ring-2 focus:ring-fiebriVerde shadow-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Descuento</label>
                    <input type="number" value={editedDiscountPrice} onChange={(e) => setEditedDiscountPrice(e.target.value)} placeholder="Opcional" className="w-full bg-white rounded-2xl px-5 py-3 text-sm font-bold text-red-500 border-none focus:ring-2 focus:ring-red-400 shadow-sm" />
                  </div>
               </div>
               <div className="flex items-center gap-3 p-2 cursor-pointer select-none" onClick={() => setEditedIsNew(!editedIsNew)}>
                  <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-1 ${editedIsNew ? 'bg-fiebriVerde' : 'bg-gray-300'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${editedIsNew ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-xs font-black text-fiebriAzul uppercase tracking-tight">Mostrar etiqueta NUEVO</span>
               </div>
            </div>
          )}

          {/* Gestión de Stock */}
          <div className="mb-8">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FaFutbol className="text-fiebriVerde" /> Disponibilidad por Tallas
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {tallasVisibles.map(t => (
                <div key={t} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${isEditing ? 'bg-white border-gray-100' : 'bg-fiebriGris border-transparent'}`}>
                  <span className="text-[10px] font-black text-gray-400 mb-1">{t}</span>
                  {isEditing ? (
                    <input type="number" value={editedStock[t] ?? ''} onChange={(e) => setEditedStock({...editedStock, [t]: parseInt(e.target.value, 10) || 0})} className="w-full text-center text-sm font-black text-fiebriAzul border-none focus:ring-0 p-0" />
                  ) : (
                    <span className={`text-sm font-black ${viewProduct?.stock?.[t] > 0 ? 'text-fiebriAzul' : 'text-gray-300'}`}>{viewProduct?.stock?.[t] || 0}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="space-y-3">
            {!isEditing ? (
              <>
                <a 
                  href={`https://wa.me/50688028216?text=${encodeURIComponent(`⚽ ¡HOLA! Me interesa esta camiseta:\n\n👕 *${viewProduct?.name}*\n🏷️ Versión: ${viewProduct?.type}\n💰 Precio: ₡${(viewProduct?.discountPrice || viewProduct?.price).toLocaleString()}\n\n📸 Imagen: ${viewProduct?.imageSrc}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="boton-fiebri-verde w-full py-5 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl"
                >
                  <FaWhatsapp size={24} /> PEDIR POR WHATSAPP
                </a>
                <div className="grid grid-cols-2 gap-3">
                  {canEdit && <button onClick={() => setIsEditing(true)} className="py-4 bg-fiebriAzul text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-fiebriAzul/90 transition-all"><FaEdit /> Editar</button>}
                  {canDelete && <button onClick={() => setShowConfirmDelete(true)} className="py-4 bg-red-50 text-red-500 font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all"><FaTrashAlt /> Eliminar</button>}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleSave} disabled={loading} className="py-5 bg-fiebriVerde text-fiebriAzul font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                  <FaCheckCircle /> {loading ? 'Guardando...' : 'Confirmar'}
                </button>
                <button onClick={() => setIsEditing(false)} className="py-5 bg-gray-100 text-gray-500 font-black rounded-2xl text-sm uppercase tracking-widest">Cancelar</button>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Confirmación de Borrado */}
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[110] bg-fiebriAzul/95 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 border-2 border-white/20">
                <FaTrashAlt className="text-red-400 text-4xl" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">¿Sacar del Catálogo?</h3>
              <p className="text-white/60 font-medium mb-10 text-sm leading-relaxed">Esta acción es irreversible. El producto y sus imágenes serán eliminados permanentemente del servidor.</p>
              <div className="flex flex-col w-full gap-3">
                <button onClick={executeDelete} disabled={loading} className="py-4 bg-red-500 text-white font-black rounded-2xl uppercase tracking-widest shadow-2xl hover:bg-red-600 transition-all">
                  {loading ? 'Procesando...' : 'Sí, Eliminar de la Cancha'}
                </button>
                <button onClick={() => setShowConfirmDelete(false)} className="py-4 text-white/50 font-black uppercase tracking-widest text-xs hover:text-white">Cancelar y Mantener</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}