import express from 'express';
import PDFDocument from 'pdfkit';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Solo personal autenticado puede exportar el inventario completo.
router.get('/export-products-pdf', requireAuth, async (req, res) => {
  try {
    if (!req.user.isSuperUser && req.user.roles.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para exportar el inventario' });
    }

    const products = await Product.find().lean();

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=productos.pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Lista de Productos', { align: 'center' });
    doc.moveDown();

    products.forEach((product, index) => {
      doc.fontSize(12).text(`Producto ${index + 1}`);
      doc.text(`Nombre: ${product.name}`);
      doc.text(`Precio: ₡${product.price}`);
      doc.text(`Tipo: ${product.type}`);

      if (product.stock) {
        doc.text('Stock:');
        for (const [talla, cantidad] of Object.entries(product.stock)) {
          doc.text(`   - Talla ${talla}: ${cantidad}`);
        }
      }

      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error('Error exportando PDF:', error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Error generando el PDF' });
  }
});

export default router;
