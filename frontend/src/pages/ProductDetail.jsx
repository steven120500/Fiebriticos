import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaWhatsapp, FaTimes, FaChevronLeft, FaChevronRight, FaEdit, 
  FaTrash, FaShoppingCart, FaArrowLeft, FaExclamationTriangle, 
  FaFutbol, FaTag, FaCheckCircle, FaPlus, FaImage
} from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from '../context/CartContext';

// Componentes
import Header from '../components/Header'; 
import TopBanner from '../components/TopBanner'; 
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal'; 
import RegisterUserModal from '../components/RegisterUserModal'; 
import Medidas from '../components/Medidas';

// 🚀 JUGADA INTELIGENTE: Detecta si es local o producción
const API_BASE = import.meta.env.VITE_API_URL || "https://fiebriticos.onrender.com"; 

const TALLAS_ADULTO = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const TALLAS_NINO   = ['16', '18', '20', '22', '24', '26', '28'];
const TALLAS_BALON  = ['3', '4', '5'];
const PLACEHOLDER_IMG = "https://via.placeholder.com/600x600?text=No+Image";

export default function ProductDetail({ 
  user, 
  onUpdate,
  onLogout,
  setShowUserListModal,
  setShowHistoryModal
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [idx, setIdx] = useState(0); 
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegisterUserModal, setShowRegisterUserModal] = useState(false);
  const [showMedidas, setShowMedidas] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [editedName, setEditedName] = useState('');
  const [editedPrice, setEditedPrice] = useState(0);
  const [editedDiscountPrice, setEditedDiscountPrice] = useState('');
  const [editedType, setEditedType] = useState('Player');
  const [editedStock, setEditedStock] = useState({});
  const [editedIsNew, setEditedIsNew] = useState(false);
  const [localImages, setLocalImages] = useState([]);

  const isSuperUser = user?.isSuperUser || user?.roles?.includes("edit");
  const canDelete = user?.isSuperUser || user?.roles?.includes("delete");
  const canSeeHistory = user?.isSuperUser || user?.roles?.includes("edit");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error("Producto no encontrado");
        const data = await res.json();
        setProduct(data);
        syncEditState(data);
      } catch (err) {
        console.error("Error cargando el producto:", err);
        setProduct(null);
      } finally {
        setLoadingFetch(false);
      }
    };
    fetchProduct();
  }, [id]);

  const syncEditState = (data) => {
    if(!data) return;
    setEditedName(data.name || '');
    setEditedPrice(data.price ?? 0);
    setEditedDiscountPrice(data.discountPrice ?? '');
    setEditedType(data.type || 'Player');
    setEditedStock({ ...(data.stock || {}) });
    setEditedIsNew(Boolean(data.isNew));
    
    let imgs = [];
    if (Array.isArray(data.images) && data.images.length > 0) {
      imgs = data.images.map(img => (typeof img === 'object' ? img.url : img)).filter(url => url);
    }
    if (imgs.length === 0) imgs.push(PLACEHOLDER_IMG);
    setLocalImages(imgs.map(src => ({ src, isNew: false })));
  };

  const handleSave = async () => {
    if (loadingAction) return;
    setLoadingAction(true);
    
    try {
      const payload = {
        name: editedName.trim(),
        price: parseInt(editedPrice, 10),
        discountPrice: editedDiscountPrice ? parseInt(editedDiscountPrice, 10) : null,
        type: editedType,
        stock: editedStock,
        // Filtramos para no enviar el placeholder a la BD
        images: localImages.map(i => i.src).filter(src => src !== PLACEHOLDER_IMG), 
        isNew: editedIsNew,
      };

      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'x-user': user?.username || 'Admin' 
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // 🚀 EL LOG MAESTRO: Aquí verás por qué falló el local
        console.log("❌ ERROR DEL BACKEND:", data); 
        throw new Error(data.message || "Error al actualizar");
      }

      setProduct(data);
      setIsEditing(false);
      toast.success("¡Información actualizada!");
      if(onUpdate) onUpdate(data);
    } catch (err) {
      console.error("❌ ERROR EN LA PETICIÓN:", err);
      toast.error(err.message || "No se pudo actualizar");
    } finally {
      setLoadingAction(false);
    }
  };

  const executeDelete = async () => {
    if (loadingAction) return;
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-user': user?.username || 'Admin' },
      });
      if (!res.ok) throw new Error();
      toast.success("Producto fuera del catálogo");
      navigate('/', { replace: true });
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const actualImgs = localImages.filter(img => img.src !== PLACEHOLDER_IMG);
    if (actualImgs.length + files.length > 2) {
      return toast.error("Solo se permiten máximo 2 imágenes por producto");
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setLocalImages(prev => {
          const current = prev.filter(img => img.src !== PLACEHOLDER_IMG);
          const newState = [...current, { src: reader.result, isNew: true }];
          setIdx(newState.length - 1); 
          return newState;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setLocalImages(prev => {
        const filtered = prev.filter((_, i) => i !== index);
        const newState = filtered.length === 0 ? [{ src: PLACEHOLDER_IMG, isNew: false }] : filtered;
        if (idx >= filtered.length) setIdx(Math.max(0, filtered.length - 1));
        return newState;
    });
  };

  const handleBuyWhatsApp = () => {
    if (!selectedSize) return toast.warning("Selecciona tu talla antes de saltar a la cancha.");
    const precioFinal = product.discountPrice || product.price;
    const mensaje = `⚽ ¡HOLA FIEBRITICOS! Me interesa esta joya:\n\n👕 *${product.name}*\n🏷️ Versión: ${product.type}\n📏 Talla: ${selectedSize}\n💰 Precio: ₡${precioFinal.toLocaleString()}\n\n¿Tienen disponibilidad inmediata?`;
    window.open(`https://wa.me/50683068960?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const handleAddToCart = () => {
    if (!selectedSize) return toast.warning("Selecciona una talla primero");
    addToCart(product, selectedSize);
    setShowDecisionModal(true);
  };

  if (loadingFetch) return (
    <div className="h-screen bg-fiebriGris flex flex-col items-center justify-center">
      <FaFutbol className="text-fiebriAzul text-5xl animate-spin mb-4" />
      <p className="text-fiebriAzul font-black uppercase tracking-widest text-xs">Cargando detalles del fichaje...</p>
    </div>
  );

  if (!product) return (
    <div className="h-screen bg-fiebriGris flex flex-col items-center justify-center px-6 text-center">
      <FaExclamationTriangle className="text-red-500 text-6xl mb-4" />
      <h2 className="text-2xl font-black text-fiebriAzul uppercase italic">¡FUERA DE JUEGO!</h2>
      <p className="text-gray-500 font-bold mt-2">No pudimos encontrar esta camiseta en nuestro inventario.</p>
      <button onClick={() => navigate('/')} className="mt-8 px-10 py-4 bg-fiebriAzul text-white font-black rounded-2xl uppercase italic">Volver al Inicio</button>
    </div>
  );

  const currentSrc = localImages[idx]?.src || PLACEHOLDER_IMG;
  const currentType = isEditing ? editedType : product.type;
  const tallasVisibles = currentType === 'Balón' ? TALLAS_BALON : (currentType === 'Niño' ? TALLAS_NINO : TALLAS_ADULTO);
  const stockRestante = selectedSize ? (isEditing ? editedStock[selectedSize] : product.stock?.[selectedSize]) : 0;

  return (
    <div className="bg-fiebriGris min-h-screen">
      <TopBanner/>
      
      <Header 
        user={user}
        onLoginClick={() => setShowLogin(true)} 
        onLogout={onLogout}
        isSuperUser={isSuperUser}
        canSeeHistory={canSeeHistory}
        setShowRegisterUserModal={setShowRegisterUserModal}
        setShowUserListModal={setShowUserListModal}
        setShowHistoryModal={setShowHistoryModal}
        onMedidasClick={() => setShowMedidas(true)}
        onLogoClick={() => navigate('/')}
      /> 

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        
        {/* 🔙 BOTÓN VOLVER TIPO FIEBRITICO */}
        <div className="mt-24 mb-6 flex items-center justify-between">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-3 bg-blue-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-fiebriVerde hover:text-fiebriAzul transition-all group active:scale-95"
            >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                Volver
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <div className="space-y-6">
            <div className="relative aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 flex items-center justify-center shadow-2xl group border-b-8 border-fiebriVerde">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSrc}
                  src={currentSrc}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                  className="w-full h-full object-contain p-4"
                />
              </AnimatePresence>
              
              {!isEditing && localImages.length > 1 && (
                <>
                  <button onClick={() => setIdx((i) => (i - 1 + localImages.length) % localImages.length)} className="absolute left-6 bg-blue-900 backdrop-blur-md p-4 rounded-2xl shadow hover:bg-fiebriVerde hover:text-fiebriAzul transition opacity-0 group-hover:opacity-100 text-white"><FaChevronLeft /></button>
                  <button onClick={() => setIdx((i) => (i + 1) % localImages.length)} className="absolute right-6 bg-blue-900 backdrop-blur-md p-4 rounded-2xl shadow hover:bg-fiebriVerde hover:text-fiebriAzul transition opacity-0 group-hover:opacity-100 text-white"><FaChevronRight /></button>
                </>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {localImages.map((img, i) => (
                <div key={i} className="relative flex-shrink-0 group">
                  <img 
                    src={img.src} 
                    onClick={() => setIdx(i)}
                    className={`w-24 h-24 object-cover rounded-2xl cursor-pointer border-4 transition-all ${idx === i ? 'border-fiebriVerde shadow-lg scale-105' : 'border-white hover:border-fiebriAzul/20'}`} 
                  />
                  {isEditing && img.src !== PLACEHOLDER_IMG && (
                    <button 
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <FaTimes size={12} />
                    </button>
                  )}
                </div>
              ))}
              
              {isEditing && localImages.length < 2 && (
                <label className="w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center border-4 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-fiebriVerde transition-colors">
                    <input type="file" multiple className="hidden" onChange={handleImageChange} />
                    <FaPlus className="text-gray-300 mb-1" />
                    <span className="text-[8px] font-black text-gray-400 uppercase">Añadir</span>
                </label>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            {isEditing ? (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-8 border-fiebriAzul space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-fiebriAzul p-2 rounded-lg"><FaEdit className="text-fiebriVerde" /></div>
                    <h3 className="font-black text-fiebriAzul uppercase italic tracking-tighter text-xl">Modo Editor</h3>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                          <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className="w-full bg-fiebriGris border-none rounded-2xl px-5 py-3 font-bold text-fiebriAzul" placeholder="Nombre de la chema" />
                          <div className="grid grid-cols-2 gap-4">
                              <select value={editedType} onChange={e => setEditedType(e.target.value)} className="w-full bg-fiebriGris border-none rounded-2xl px-5 py-3 font-bold text-fiebriAzul">
                                  {['Player','Fan','Mujer','Nacional','Abrigos','Retro','Niño','Balón'].map(t => <option key={t}>{t}</option>)}
                              </select>
                              <label className="flex items-center gap-3 px-5 py-3 bg-fiebriGris rounded-2xl cursor-pointer">
                                  <input type="checkbox" checked={editedIsNew} onChange={e => setEditedIsNew(e.target.checked)} className="rounded border-none text-fiebriVerde" />
                                  <span className="text-[10px] font-black uppercase text-fiebriAzul">¿Nuevo?</span>
                              </label>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-fiebriAzul">₡</span>
                            <input type="number" min="0" value={editedPrice} onChange={e => setEditedPrice(Math.max(0, e.target.value))} className="w-full bg-fiebriGris border-none rounded-2xl pl-10 pr-4 py-3 font-bold text-fiebriAzul" />
                          </div>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-red-500">₡</span>
                            <input type="number" min="0" value={editedDiscountPrice} onChange={e => setEditedDiscountPrice(Math.max(0, e.target.value))} className="w-full bg-red-50 border-none rounded-2xl pl-10 pr-4 py-3 font-bold text-red-500" placeholder="Oferta" />
                          </div>
                      </div>

                      <div className="p-5 bg-fiebriGris rounded-[2rem]">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest text-center">Gestión de Tallas</p>
                        <div className="grid grid-cols-4 gap-3">
                          {tallasVisibles.map(t => (
                            <div key={t} className="flex flex-col items-center">
                              <span className="text-[9px] font-black text-fiebriAzul mb-1">{t}</span>
                              <input 
                                    type="number" 
                                    min="0"
                                    placeholder="0"
                                    className="w-full bg-white border-none rounded-xl text-center p-2 text-xs font-black shadow-sm focus:ring-2 focus:ring-fiebriVerde" 
                                    value={editedStock[t] === 0 ? '' : (editedStock[t] || '')} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const numVal = val === '' ? 0 : parseInt(val, 10);
                                        setEditedStock(prev => ({ ...prev, [t]: Math.max(0, numVal) }));
                                    }} 
                                />
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={handleSave} disabled={loadingAction} className="flex-1 boton-fiebri-verde py-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg">
                        {loadingAction ? '...' : 'GUARDAR'}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="px-6 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs">CANCELAR</button>
                  </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-8 border-fiebriAzul">
                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-fiebriAzul text-white font-black text-[10px] uppercase rounded-full tracking-[0.2em]">{product.type}</span>
                      {product.isNew && <span className="px-3 py-1 bg-fiebriVerde text-fiebriAzul font-black text-[10px] uppercase rounded-full tracking-[0.2em] shadow-sm">NUEVO</span>}
                      {product.discountPrice > 0 && <span className="px-3 py-1 bg-red-500 text-white font-black text-[10px] uppercase rounded-full tracking-[0.2em] flex items-center gap-1"><FaTag size={8}/> OFERTA</span>}
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none tracking-tighter text-fiebriAzul mb-4">{product.name}</h1>
                  
                  <div className="flex items-baseline gap-4 mt-6">
                    {product.discountPrice ? (
                      <>
                        <span className="text-5xl font-black text-fiebriVerde italic tracking-tighter">₡{product.discountPrice.toLocaleString()}</span>
                        <span className="text-2xl text-gray-300 line-through decoration-red-400">₡{product.price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-5xl font-black text-fiebriAzul italic tracking-tighter">₡{product.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="mb-10 p-6 bg-fiebriGris rounded-[2rem] border-2 border-transparent hover:border-fiebriVerde/20 transition-all">
                  
                  {product.type === "Player" && (
                    <div className="mb-6 flex items-start gap-4 bg-white p-4 rounded-2xl border-l-4 border-fiebriAzul shadow-sm">
                      <FaExclamationTriangle className="text-fiebriAzul mt-1 flex-shrink-0" />
                      <p className="text-[11px] font-bold text-fiebriAzul leading-relaxed uppercase">
                        <span className="text-fiebriVerde">IMPORTANTE:</span> Esta versión es de corte ajustado. Te recomendamos elegir una talla más grande.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-4 px-2">
                    <p className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400">Tallas Disponibles</p>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {tallasVisibles.map(size => {
                      const qty = product.stock?.[size] || 0;
                      const active = selectedSize === size;
                      return (
                        <button
                          key={size}
                          disabled={qty <= 0}
                          onClick={() => setSelectedSize(size)}
                          className={`h-14 rounded-2xl font-black text-sm transition-all relative border-2
                            ${qty <= 0 ? 'bg-transparent border-gray-100 text-gray-200 cursor-not-allowed opacity-50' : 
                             active ? 'bg-fiebriVerde border-fiebriVerde text-fiebriAzul shadow-lg scale-110 z-10' : 
                             'bg-white border-white text-fiebriAzul hover:border-fiebriAzul/20 shadow-sm'}
                          `}
                        >
                          {size}
                          {active && <div className="absolute -top-1 -right-1 w-3 h-3 bg-fiebriAzul rounded-full border-2 border-fiebriVerde" />}
                        </button>
                      )
                    })}
                  </div>

                  <AnimatePresence>
                    {selectedSize && stockRestante > 0 && stockRestante <= 2 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center justify-center gap-2 bg-red-50 p-3 rounded-xl border border-red-100">
                        <FaFutbol className="text-red-500 animate-bounce text-xs" />
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">¡Últimas unidades disponibles!</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-4">
                  <button onClick={handleBuyWhatsApp} className="boton-fiebri-verde w-full py-5 rounded-2xl text-white font-black text-xl flex items-center justify-center gap-4 shadow-xl active:scale-95">
                    <FaWhatsapp size={28} /> COMPRAR POR WHATSAPP
                  </button>
                </div>

                {(isSuperUser || canDelete) && (
                  <div className="mt-16 pt-8 border-t-2 border-fiebriGris">
                    <div className="flex items-center gap-2 justify-center mb-6">
                      <FaFutbol className="text-gray-200 text-xs" />
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Área Técnica</p>
                      <FaFutbol className="text-gray-200 text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {isSuperUser && <button onClick={() => setIsEditing(true)} className="py-4 bg-fiebriGris text-fiebriAzul font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-fiebriAzul transition-all flex items-center justify-center gap-3"><FaEdit /> EDITAR</button>}
                      {canDelete && <button onClick={() => setShowConfirmDelete(true)} className="py-4 bg-red-50 text-red-500 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"><FaTrash /> ELIMINAR</button>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showDecisionModal && (
            <div className="fixed inset-0 z-[200] bg-fiebriAzul/60 backdrop-blur-md flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border-b-8 border-fiebriVerde">
                <div className="w-20 h-20 bg-fiebriVerde rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-12">
                  <FaCheckCircle className="text-fiebriAzul text-4xl" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-fiebriAzul mb-2">¡DENTRO DEL ÁREA!</h3>
                <p className="text-gray-400 text-sm mb-10 font-medium px-4">Tu chema ya está en el carrito.</p>
                <div className="space-y-3">
                  <button onClick={() => navigate('/checkout')} className="boton-fiebri-verde w-full py-5 rounded-2xl text-white font-black text-lg shadow-xl">FINALIZAR COMPRA</button>
                  <button onClick={() => { setShowDecisionModal(false); navigate('/'); }} className="w-full bg-fiebriGris text-fiebriAzul py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200">SEGUIR VIENDO</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-[200] bg-red-900/40 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border-b-8 border-red-500">
              <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500"><FaTrash size={32} /></div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-fiebriAzul mb-2">¿SACAR DEL EQUIPO?</h3>
              <p className="text-gray-400 text-sm mb-10 font-medium">Esta acción es irreversible.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowConfirmDelete(false)} className="py-4 bg-fiebriGris text-gray-500 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
                <button onClick={executeDelete} className="py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-200">{loadingAction ? '...' : 'Eliminar'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <AnimatePresence>
        {showMedidas && <Medidas open={showMedidas} onClose={() => setShowMedidas(false)} />}
      </AnimatePresence>
    </div>
  );
}