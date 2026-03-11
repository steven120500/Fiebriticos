import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import tallaPorTipo from "../utils/tallaPorTipo";

const API_BASE = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://fiebriticos.onrender.com"; 

const MAX_IMAGES = 2;
const MAX_WIDTH = 1000;
const QUALITY = 0.75;

// 🔹 Funciones de utilidad para imágenes (WebP)
async function convertToWebpBlob(file, maxWidth = MAX_WIDTH, quality = QUALITY) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Formato no soportado"));
    i.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
  canvas.width = Math.round(img.width * ratio);
  canvas.height = Math.round(img.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
  });
}

export default function AddProductModal({ onAdd, onCancel, user }) {
  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [type, setType] = useState("Player");
  const [isNew, setIsNew] = useState(false);
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const tallas = useMemo(() => {
    const tipos = { ...tallaPorTipo, Balón: ["3", "4", "5"] };
    return tipos[type] || [];
  }, [type]);

  const handleFiles = async (e) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const files = Array.from(filesList).slice(0, MAX_IMAGES - images.length);
    try {
      setLoading(true);
      const converted = [];
      for (const file of files) {
        const blob = await convertToWebpBlob(file);
        const previewUrl = URL.createObjectURL(blob);
        converted.push({ blob, previewUrl });
      }
      setImages((prev) => [...prev, ...converted].slice(0, MAX_IMAGES));
    } catch (err) {
      toast.error("Error optimizando imagen");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const copy = [...prev];
      if (copy[index]?.previewUrl) URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!name.trim() || !price || !images.length) {
      return toast.error("Faltan datos: Nombre, Precio y al menos una foto.");
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", String(price).trim());
      if (discountPrice) formData.append("discountPrice", String(discountPrice).trim());
      formData.append("type", type.trim());
      formData.append("stock", JSON.stringify(stock));
      formData.append("isNew", isNew ? "true" : "false");

      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i].blob, `fiebri-${i}.webp`);
      }

      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: { "x-user": user?.username || "Admin" },
        body: formData,
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      onAdd?.(data);
      onCancel?.();
      toast.success("¡Chema publicada con éxito! ⚽");
    } catch (err) {
      toast.error("Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Fondo Difuminado */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-fiebriAzul/60 backdrop-blur-md"
      />

      {/* Contenedor del Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-b-8 border-fiebriVerde"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-fiebriAzul uppercase italic tracking-tighter leading-none">Nueva Joya</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Área de Gestión de Inventario</p>
          </div>
          <button onClick={onCancel} className="bg-fiebriGris p-3 rounded-2xl text-gray-400 hover:text-red-500 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-8 pt-0 overflow-y-auto scroll-custom space-y-6">
          
          {/* Subida de Fotos */}
          <div className="flex gap-4 justify-center">
            {images.map((img, i) => (
              <div key={i} className="relative group w-32 h-40">
                <img src={img.previewUrl} className="w-full h-full object-cover rounded-[1.5rem] border-2 border-fiebriGris shadow-lg" alt="Preview" />
                <button onClick={() => handleRemoveImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-xl hover:scale-110 transition">
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-40 bg-fiebriGris border-2 border-dashed border-gray-200 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-fiebriVerde hover:text-fiebriVerde transition-all group"
              >
                <FaCloudUploadAlt size={32} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Subir</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </div>

          {/* Inputs Principales */}
          <div className="space-y-4">
            <div className="bg-fiebriGris p-1 rounded-2xl">
              <input
                type="text"
                placeholder="Nombre de la chema..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-none rounded-xl px-5 py-4 font-bold text-fiebriAzul placeholder:text-gray-300 shadow-sm focus:ring-2 focus:ring-fiebriAzul/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-fiebriGris p-1 rounded-2xl">
                <input
                  type="number"
                  placeholder="Precio ₡"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white border-none rounded-xl px-5 py-4 font-bold text-fiebriAzul shadow-sm"
                />
              </div>
              <div className="bg-fiebriGris p-1 rounded-2xl">
                <input
                  type="number"
                  placeholder="Oferta ₡"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full bg-red-50 border-none rounded-xl px-5 py-4 font-bold text-red-500 shadow-sm placeholder:text-red-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-fiebriAzul text-white px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border-none cursor-pointer"
              >
                {Object.keys({ ...tallaPorTipo, Balón: ["3", "4", "5"] }).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <label className="flex items-center justify-center gap-3 bg-fiebriGris rounded-2xl cursor-pointer hover:bg-fiebriVerde/10 transition-colors">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-5 h-5 text-fiebriVerde rounded border-none focus:ring-0"
                />
                <span className="text-[10px] font-black uppercase text-fiebriAzul tracking-widest">¿Nuevo?</span>
              </label>
            </div>
          </div>

          {/* Inventario */}
          <div className="bg-fiebriGris/50 p-6 rounded-[2rem] border border-gray-100">
            <p className="text-[10px] font-black text-fiebriAzul uppercase mb-4 tracking-[0.3em] text-center border-b border-gray-100 pb-3">Stock por Talla</p>
            <div className="grid grid-cols-4 gap-3">
              {tallas.map((size) => (
                <div key={size} className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-gray-400 mb-2">{size}</span>
                  <input
                    type="number"
                    value={stock[size] ?? ""}
                    onChange={(e) => setStock(prev => ({ ...prev, [size]: e.target.value }))}
                    className="w-full py-3 text-center bg-white rounded-xl border-none focus:ring-2 focus:ring-fiebriVerde text-xs font-black text-fiebriAzul shadow-sm"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="p-8 pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full boton-fiebri-verde py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Registrando ..." : "Publicar Chema"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}