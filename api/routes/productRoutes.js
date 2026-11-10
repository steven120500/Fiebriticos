import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import History from '../models/History.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

/* ================= Multer (Para subidas directas) ================= */
const MAX_IMAGES = 10;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: MAX_IMAGES },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(png|jpe?g|webp|heic|heif)$/i.test(file.mimetype)),
});

/* ================= Helpers ================= */
const ADULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const KID_SIZES = ['16', '18', '20', '22', '24', '26', '28'];
const BALL_SIZES = ['3', '4', '5'];
const ALL_SIZES = new Set([...ADULT_SIZES, ...KID_SIZES, ...BALL_SIZES]);

const DATA_IMAGE_RE = /^data:image\/(png|jpe?g|webp|heic|heif);base64,[A-Za-z0-9+/=\s]+$/i;
const HTTPS_URL_RE = /^https:\/\/[^\s"'<>]+$/i;

const str = (v) => (typeof v === 'string' ? v : '');
const toBool = (v) => v === true || v === 'true';
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Helper para subir Buffers (Multer) */
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'fiebriticos_products', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

/** Helper para limpiar stock */
function sanitizeInv(obj) {
  const clean = {};
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return clean;
  for (const [size, qty] of Object.entries(obj)) {
    if (!ALL_SIZES.has(String(size))) continue;
    clean[size] = Math.max(0, Math.trunc(Number(qty) || 0));
  }
  return clean;
}

function parsePrice(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

function logHistory(req, action, item, productId, details) {
  return History.create({
    user: req.user?.name || 'Desconocido',
    action,
    item,
    productId: String(productId),
    details,
  }).catch((err) => console.error('Error historial:', err.message));
}

function validId(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ error: 'Producto no encontrado' });
    return false;
  }
  return true;
}

/* ================= Rutas ================= */

/** Health check */
router.get('/health', async (_req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ ok: true, count });
  } catch {
    res.status(500).json({ ok: false });
  }
});

/** 1. Listado paginado */
router.get('/', async (req, res) => {
  try {
    const page = Math.min(Math.max(parseInt(str(req.query.page) || '1', 10) || 1, 1), 10000);
    const limit = Math.min(Math.max(parseInt(str(req.query.limit) || '20', 10) || 20, 1), 100);
    const q = str(req.query.q).trim().slice(0, 100);
    const type = str(req.query.type).trim().slice(0, 40);
    const sizes = str(req.query.sizes).trim();
    const mode = str(req.query.mode).trim();
    const isMundial = req.query.isMundial === 'true';

    const find = {};
    // Escapamos la búsqueda para evitar inyección de regex / ReDoS
    if (q) find.name = { $regex: escapeRegex(q), $options: 'i' };

    if (isMundial) {
      find.isMundial = true;
    } else if (type === 'Ofertas') {
      find.discountPrice = { $ne: null, $gt: 0 };
    } else if (mode === 'disponibles') {
      find.$and = [
        { $or: [{ discountPrice: { $exists: false } }, { discountPrice: null }, { discountPrice: 0 }] },
        { $expr: { $gt: [{ $sum: { $map: { input: { $objectToArray: '$stock' }, as: 's', in: '$$s.v' } } }, 0] } },
      ];
    } else if (type) {
      find.type = type;
    }

    if (sizes) {
      // Solo tallas válidas: evita inyectar rutas arbitrarias en la consulta
      const sizesArray = sizes.split(',').map((s) => s.trim()).filter((s) => ALL_SIZES.has(s));
      if (sizesArray.length > 0) {
        find.$or = sizesArray.map((size) => ({ [`stock.${size}`]: { $gt: 0 } }));
      }
    }

    const projection = 'name price discountPrice type imageSrc images stock bodega createdAt isNew isMundial';

    const [items, total] = await Promise.all([
      Product.find(find).select(projection).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(find),
    ]);

    res.set('Cache-Control', 'public, max-age=20');
    res.json({
      items: items || [],
      total: total || 0,
      page,
      pages: Math.ceil(total / limit),
      limit,
    });
  } catch (err) {
    console.error('❌ ERROR GET /api/products:', err.message);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

/** 2. Obtener un solo producto por ID */
router.get('/:id', async (req, res) => {
  if (!validId(req, res)) return;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

/** 3. Crear producto (Soporta JSON/Base64 y FormData) — requiere rol "add" */
router.post('/', requireRole('add'), upload.any(), async (req, res) => {
  try {
    let images = [];

    if (Array.isArray(req.body.images) && req.body.images.length > 0) {
      const list = req.body.images.slice(0, MAX_IMAGES);
      // Solo aceptamos imágenes en base64 (nunca URLs arbitrarias que Cloudinary iría a descargar)
      if (!list.every((img) => typeof img === 'string' && DATA_IMAGE_RE.test(img))) {
        return res.status(400).json({ error: 'Formato de imagen inválido' });
      }
      const results = await Promise.all(
        list.map((img) => cloudinary.uploader.upload(img, { folder: 'fiebriticos_products', resource_type: 'image' }))
      );
      images = results.map((u) => ({ public_id: u.public_id, url: u.secure_url }));
    } else if (req.files && req.files.length > 0) {
      const files = req.files.filter((f) => f.fieldname === 'images' || f.fieldname === 'image');
      const uploaded = await Promise.all(files.map((f) => uploadToCloudinary(f.buffer)));
      images = uploaded.map((u) => ({ public_id: u.public_id, url: u.secure_url }));
    }

    let stock = {};
    try {
      if (typeof req.body.stock === 'string') stock = JSON.parse(req.body.stock);
      else if (typeof req.body.stock === 'object') stock = req.body.stock;
    } catch {
      stock = {};
    }

    const price = parsePrice(req.body.price);
    const discountPrice = parsePrice(req.body.discountPrice);
    if (price === null || Number.isNaN(price) || Number.isNaN(discountPrice)) {
      return res.status(400).json({ error: 'Precio inválido' });
    }

    const product = await Product.create({
      name: str(req.body.name).trim(),
      price,
      discountPrice,
      type: str(req.body.type).trim(),
      stock: sanitizeInv(stock),
      imageSrc: images[0]?.url || undefined,
      images,
      isNew: toBool(req.body.isNew),
      isMundial: toBool(req.body.isMundial),
    });

    await logHistory(req, 'Crear', product.name, product._id, 'Se creó la camiseta y se agregó al catálogo.');

    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Error en POST /api/products:', err.message);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

/** 4. Actualizar producto — requiere rol "edit" */
router.put('/:id', requireRole('edit'), async (req, res) => {
  if (!validId(req, res)) return;
  try {
    const prev = await Product.findById(req.params.id);
    if (!prev) return res.status(404).json({ error: 'Producto no encontrado' });

    const name = str(req.body.name).trim();
    const type = str(req.body.type).trim();
    const price = req.body.price !== undefined ? parsePrice(req.body.price) : prev.price;
    const discountPrice = req.body.discountPrice !== undefined ? parsePrice(req.body.discountPrice) : prev.discountPrice;

    if (price === null || Number.isNaN(price) || Number.isNaN(discountPrice)) {
      return res.status(400).json({ error: 'Precio inválido' });
    }

    // Nota: no usamos prev.save() porque "isNew" es un nombre reservado de Mongoose.
    const update = {
      name: name || prev.name,
      type: type || prev.type,
      price,
      discountPrice: discountPrice && discountPrice > 0 ? discountPrice : null,
      stock: req.body.stock ? sanitizeInv(req.body.stock) : prev.stock,
      isNew: req.body.isNew !== undefined ? toBool(req.body.isNew) : prev.get('isNew'),
      isMundial: req.body.isMundial !== undefined ? toBool(req.body.isMundial) : prev.isMundial,
    };

    if (Array.isArray(req.body.images)) {
      const list = req.body.images.slice(0, MAX_IMAGES);
      const existingByUrl = new Map(
        (prev.images || []).map((img) => [img.url, { public_id: img.public_id ?? null, url: img.url }])
      );
      const normalized = [];
      for (const raw of list) {
        if (typeof raw !== 'string') continue;
        if (DATA_IMAGE_RE.test(raw)) {
          const up = await cloudinary.uploader.upload(raw, { folder: 'fiebriticos_products', resource_type: 'image' });
          normalized.push({ public_id: up.public_id, url: up.secure_url });
        } else if (HTTPS_URL_RE.test(raw)) {
          // Mantener imágenes existentes (conservando su public_id para poder borrarlas luego)
          normalized.push(existingByUrl.get(raw) || { public_id: null, url: raw });
        }
      }
      if (normalized.length > 0) {
        update.images = normalized;
        update.imageSrc = normalized[0].url;
      }
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });

    await logHistory(req, 'Editar', updated.name, updated._id, 'Se modificó la información del producto.');

    res.json(updated);
  } catch (err) {
    console.error('❌ Error en PUT /api/products:', err.message);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

/** 5. Eliminar producto — requiere rol "delete" */
router.delete('/:id', requireRole('delete'), async (req, res) => {
  if (!validId(req, res)) return;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    for (const img of product.images || []) {
      if (img.public_id) {
        try { await cloudinary.uploader.destroy(img.public_id); } catch {}
      }
    }

    const productName = product.name;
    await product.deleteOne();

    await logHistory(req, 'Eliminar', productName, req.params.id, 'Se eliminó la camiseta del sistema.');

    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error('❌ Error en DELETE /api/products:', err.message);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;
