import express from 'express';
import History from '../models/History.js';
import { requireRole, requireSuper } from '../middleware/auth.js';

const router = express.Router();

// GET: Obtener historial con filtro de fecha opcional (rol "history" o superusuario)
router.get('/', requireRole('history'), async (req, res) => {
  try {
    const date = typeof req.query.date === 'string' ? req.query.date : '';
    const query = {};

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
        return res.status(400).json({ error: 'Fecha inválida (usa AAAA-MM-DD)' });
      }
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      query.date = { $gte: start, $lte: end };
    }

    const history = await History.find(query).sort({ date: -1 }).limit(2000).lean();
    res.json(history);
  } catch (err) {
    console.error('Error al obtener historial:', err.message);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

/* ========= DELETE: Limpiar historial (solo superusuario, verificado por JWT) ========= */
router.delete('/', requireSuper, async (_req, res) => {
  try {
    await History.deleteMany({});
    res.json({ ok: true, message: 'El historial de la temporada ha sido limpiado' });
  } catch (err) {
    console.error('Error al limpiar historial:', err.message);
    res.status(500).json({ error: 'Error al limpiar historial' });
  }
});

export default router;
