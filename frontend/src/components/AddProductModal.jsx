import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import tallaPorTipo from "../utils/tallaPorTipo";

const API_BASE = import.meta.env.VITE_API_BASE || "https://fiebriticos.onrender.com";
const MAX_IMAGES = 2;
const MAX_WIDTH = 1000;
const QUALITY = 0.75;

// 🔹 Convierte File -> WebP
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

  const blob = await new Promise((resolve) => {
    const tryType = "image/webp";
    canvas.toBlob(
      (b) => resolve(b),
      canvas.toDataURL(tryType).startsWith("data:image/webp") ? tryType : "image/png",
      quality
    );
  });

  if (!blob) throw new Error("No se pudo convertir la imagen");
  return blob;
}

async function srcToBlob(src) {
  if (!src) throw new Error("Imagen sin src");
  if (src.startsWith("blob:") || src.startsWith("http")) {
    const r = await fetch(src);
    if (!r.ok) throw new Error("No se pudo leer blob/url");
    return await r.blob();
  }
  if (src.startsWith("data:")) {
    const parts = src.split(",");
    const bin = atob(parts[1]);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new Blob([u8], { type: "image/webp" });
  }
  throw new Error("Formato no soportado");
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

  const handleFiles = async (filesLike) => {
    const files = Array.from(filesLike).slice(0, MAX_IMAGES - images.length);
    if (files.length === 0) return;
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
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const copy = prev.slice();
      if (copy[index]?.previewUrl) URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleInvChange = (size, value) => {
    const num = value === "" ? 0 : Math.max(0, parseInt(value, 10) || 0);
    setStock((prev) => ({ ...prev, [size]: num }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      if (!name.trim() || !price || !type.trim() || !images.length) {
        toast.error("Faltan datos obligatorios");
        return;
      }

      // ✅ CAMBIO: Ahora el nombre por defecto es Fiebriticos
      const displayName = user?.username || "Fiebriticos";

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", String(price).trim());
      if (discountPrice) formData.append("discountPrice", String(discountPrice).trim());
      formData.append("type", type.trim());
      formData.append("stock", JSON.stringify(stock));
      formData.append("isNew", isNew ? "true" : "false");

      for (let i = 0; i < images.length; i++) {
        const blob = images[i].blob || (await srcToBlob(images[i].src));
        formData.append("images", blob, `fiebri-${i}.webp`);
      }

      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: { "x-user": displayName },
        body: formData,
      });

      if (!res.ok) throw new Error("Error al guardar");
      const data = await res.json();
      onAdd?.(data);
      onCancel?.();
      toast.success("¡Producto listo en el catálogo!");
    } catch (err) {
      toast.error("Error guardando producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-fiebriAzul/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-fiebriAzul relative">
        
        {/* Botón cerrar - Ahora Azul Fiebri */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-fiebriAzul transition-colors"
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-2xl font-bold text-fiebriAzul mb-2">Nuevo Producto</h2>
        <p className="text-gray-500 text-sm mb-6">Subí las fotos y definí el inventario.</p>

        {/* Previews de imágenes */}
        <div className="flex gap-3 justify-center mb-6">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={img.previewUrl} className="w-24 h-24 object-cover rounded-xl border-2 border-fiebriGris" />
              <button
                onClick={() => handleRemoveImage(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:scale-110 transition"
              >
                ✕
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:border-fiebriVerde hover:text-fiebriVerde transition-all"
            >
              +
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFiles} />
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nombre (ej: Camiseta Real Madrid 2024)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-fiebriGris border-none rounded-xl focus:ring-2 focus:ring-fiebriAzul"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Precio (₡)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 bg-fiebriGris border-none rounded-xl focus:ring-2 focus:ring-fiebriAzul"
            />
            <input
              type="number"
              placeholder="Descuento (₡)"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              className="w-full px-4 py-3 bg-fiebriGris border-none rounded-xl focus:ring-2 focus:ring-fiebriAzul"
            />
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 bg-fiebriGris border-none rounded-xl focus:ring-2 focus:ring-fiebriAzul"
          >
            {Object.keys({ ...tallaPorTipo, Balón: ["3", "4", "5"] }).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className="flex items-center gap-3 cursor-pointer p-2">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(e) => setIsNew(e.target.checked)}
              className="w-5 h-5 text-fiebriVerde rounded focus:ring-fiebriVerde"
            />
            <span className="text-gray-700 font-medium">Marcar como producto nuevo</span>
          </label>

          {/* Inventario */}
          <div className="bg-fiebriGris p-4 rounded-xl">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Inventario por talla</p>
            <div className="grid grid-cols-4 gap-2">
              {tallas.map((size) => (
                <div key={size} className="flex flex-col items-center">
                  <span className="text-xs font-bold text-fiebriAzul mb-1">{size}</span>
                  <input
                    type="number"
                    value={stock[size] ?? ""}
                    onChange={(e) => handleInvChange(size, e.target.value)}
                    className="w-full py-1 text-center bg-white rounded-lg border border-gray-200 focus:border-fiebriVerde focus:ring-0 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 boton-fiebri-verde py-4 rounded-xl text-white font-bold disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Publicar Producto"}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}