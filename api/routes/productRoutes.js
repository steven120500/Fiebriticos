import express from 'express';
import Product from '../models/Product.js';
import History from '../models/History.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

const router = express.Router();

/* ================= Multer (Para subidas directas) ================= */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ================= Helpers ================= */
const ADULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const KID_SIZES = ['16', '18', '20', '22', '24', '26', '28'];
const BALL_SIZES = ['3', '4', '5'];
const ALL_SIZES = new Set([...ADULT_SIZES, ...KID_SIZES, ...BALL_SIZES]);

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
  for (const [size, qty] of Object.entries(obj || {})) {
    if (!ALL_SIZES.has(String(size))) continue;
    const n = Math.max(0, Math.trunc(Number(qty) || 0));
    clean[size] = n;
  }
  return clean;
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
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const q = (req.query.q || '').trim();
    const type = (req.query.type || '').trim();
    const sizes = (req.query.sizes || '').trim();
    const mode = (req.query.mode || '').trim();

    const find = {};
    if (q) find.name = { $regex: q, $options: 'i' };

    if (type === 'Ofertas') {
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
      const sizesArray = sizes.split(',').map((s) => s.trim()).filter(Boolean);
      if (sizesArray.length > 0) {
        find.$or = sizesArray.map((size) => ({ [`stock.${size}`]: { $gt: 0 } }));
      }
    }

    const projection = 'name price discountPrice type imageSrc images stock bodega createdAt isNew';

    const [items, total] = await Promise.all([
      Product.find(find).select(projection).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(find),
    ]);

    res.set('Cache-Control', 'public, max-age=20');
    res.json({
      items: items || [],
      total: total || 0,
      page,
      pages: limit > 0 ? Math.ceil(total / limit) : 0,
      limit,
    });
  } catch (err) {
    console.error('❌ ERROR GET /api/products:', err);
    res.status(500).json({ error: 'Error al obtener los productos', details: err.message });
  }
});

/** 2. Obtener un solo producto por ID */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

/** 3. Crear producto (Soporta JSON/Base64 y FormData) */
router.post('/', upload.any(), async (req, res) => {
  try {
    let images = [];

    // 🚀 JUGADA PARA BASE64 (JSON)
    if (req.body.images && Array.isArray(req.body.images)) {
      const uploadPromises = req.body.images.map(imgBase64 => 
        cloudinary.uploader.upload(imgBase64, { folder: 'fiebriticos_products' })
      );
      const results = await Promise.all(uploadPromises);
      images = results.map(u => ({ public_id: u.public_id, url: u.secure_url }));
    } 
    // 🚀 JUGADA PARA BINARIOS (Multer/FormData)
    else if (req.files && req.files.length > 0) {
      const files = req.files.filter(f => f.fieldname === 'images' || f.fieldname === 'image');
      const uploaded = await Promise.all(files.map(f => uploadToCloudinary(f.buffer)));
      images = uploaded.map(u => ({ public_id: u.public_id, url: u.secure_url }));
    }

    const imageSrc = images[0]?.url || '';

    // Procesar Stock
    let stock = {};
    try {
      if (typeof req.body.stock === 'string') stock = JSON.parse(req.body.stock);
      else if (typeof req.body.stock === 'object') stock = req.body.stock;
    } catch { stock = {}; }
    
    const isNew = req.body.isNew === 'true' || req.body.isNew === true;

    const product = await Product.create({
      name: String(req.body.name || '').trim(),
      price: Number(req.body.price),
      discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : null,
      type: String(req.body.type || '').trim(),
      stock: sanitizeInv(stock),
      imageSrc,
      images,
      isNew,
    });

    // Registro de Historial
    const adminUser = req.headers['x-user'] || 'Administrador';
    await History.create({
      user: adminUser,
      action: 'Crear',
      item: product.name,
      productId: product._id,
      details: 'Se creó la camiseta y se agregó al catálogo.'
    }).catch(err => console.error("Error historial:", err));

    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error en POST /api/products:", err);
    res.status(500).json({ error: err.message || 'Error al crear producto' });
  }
});

/** 4. Actualizar producto */
router.put('/:id', async (req, res) => {
  try {
    const prev = await Product.findById(req.params.id);
    if (!prev) return res.status(404).json({ error: 'Producto no encontrado' });

    let nextStock = prev.stock;
    if (req.body.stock) nextStock = sanitizeInv(req.body.stock);

    const update = {
      name: req.body.name ? req.body.name.trim() : prev.name,
      type: req.body.type ? req.body.type.trim() : prev.type,
      price: Number(req.body.price) || prev.price,
      discountPrice: req.body.discountPrice !== undefined ? Number(req.body.discountPrice) : prev.discountPrice,
      stock: nextStock,
      isNew: req.body.isNew !== undefined ? req.body.isNew : prev.isNew
    };

    // Procesar imágenes nuevas si vienen en Base64
    if (Array.isArray(req.body.images)) {
      const normalized = [];
      for (const raw of req.body.images) {
        if (typeof raw === 'string' && raw.startsWith('data:')) {
          const up = await cloudinary.uploader.upload(raw, { folder: 'fiebriticos_products' });
          normalized.push({ public_id: up.public_id, url: up.secure_url });
        } else {
          // Mantener imágenes que ya eran URLs
          normalized.push({ public_id: null, url: raw });
        }
      }
      if (normalized.length > 0) {
        update.images = normalized;
        update.imageSrc = normalized[0].url;
      }
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });

    const adminUser = req.headers['x-user'] || 'Administrador';
    await History.create({
      user: adminUser,
      action: 'Editar',
      item: updated.name,
      productId: updated._id,
      details: 'Se modificó la información del producto.'
    }).catch(err => console.error("Error historial:", err));

    res.json(updated);
  } catch (err) {
    console.error("❌ Error en PUT /api/products:", err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

/** 5. Eliminar producto */
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    for (const img of product.images || []) {
      if (img.public_id) { try { await cloudinary.uploader.destroy(img.public_id); } catch {} }
    }
    
    const productName = product.name; 
    await product.deleteOne();

    const adminUser = req.headers['x-user'] || 'Administrador';
    await History.create({
      user: adminUser,
      action: 'Eliminar',
      item: productName, 
      productId: req.params.id,
      details: 'Se eliminó la camiseta del sistema.'
    }).catch(err => console.error("Error historial:", err));

    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;