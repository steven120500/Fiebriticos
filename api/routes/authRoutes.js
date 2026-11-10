import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { attachUser, requireSuper, VALID_ROLES } from '../middleware/auth.js';
import rateLimit from '../middleware/rateLimit.js';

const router = express.Router();

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const MIN_PASSWORD = 6;
const MAX_PASSWORD = 128;

// Convierte cualquier valor a string (evita inyección NoSQL tipo { "$ne": null })
const str = (v) => (typeof v === 'string' ? v : '');
const normEmail = (v) => str(v).trim().toLowerCase();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

/**
 * 1️⃣ REGISTRO DE USUARIOS
 * Público: cualquiera puede crear cuenta, pero SIN roles.
 * Solo un superusuario autenticado puede asignar roles de administración.
 */
router.post('/register', registerLimiter, attachUser, async (req, res) => {
  try {
    const firstName = str(req.body.firstName).trim().slice(0, 60);
    const lastName = str(req.body.lastName).trim().slice(0, 60);
    const email = normEmail(req.body.email);
    const phone = str(req.body.phone).trim();
    const password = str(req.body.password);

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return res.status(400).json({ message: 'Correo inválido' });
    }
    if (!/^\d{8}$/.test(phone)) {
      return res.status(400).json({ message: 'El celular debe tener exactamente 8 números' });
    }
    if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
      return res.status(400).json({ message: `La contraseña debe tener entre ${MIN_PASSWORD} y ${MAX_PASSWORD} caracteres` });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Este correo ya está registrado' });
    }

    let roles = [];
    if (req.user?.isSuperUser && Array.isArray(req.body.roles)) {
      roles = [...new Set(req.body.roles.filter((r) => VALID_ROLES.includes(r)))];
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      username: email,
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      roles,
      isSuperUser: false,
    });

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error en registro:', error.message);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

/**
 * 2️⃣ LOGIN DE USUARIOS
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const password = str(req.body.password);

    if (!email || !password || password.length > MAX_PASSWORD) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Solo el id va en el token; roles/permisos se leen siempre de la BD.
    const token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });

    res.json({
      token,
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      isSuperUser: user.isSuperUser,
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

/**
 * 3️⃣ SOLICITAR RECUPERACIÓN (sin envío de correos: el enlace queda en el log del servidor)
 * Siempre responde lo mismo para no revelar qué correos existen.
 */
router.post('/forgot-password', resetLimiter, async (req, res) => {
  const genericMsg = { message: 'Si el correo existe, se generó un enlace de recuperación.' };
  try {
    const email = normEmail(req.body.email);
    if (!email) return res.json(genericMsg);

    const user = await User.findOne({ email });
    if (!user) return res.json(genericMsg);

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.log(`⚠️ ENLACE DE RECUPERACIÓN PARA ${user.email}: ${frontendUrl}/reset-password/${resetToken}`);

    res.json(genericMsg);
  } catch (error) {
    console.error('Error en forgot-password:', error.message);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

/**
 * 4️⃣ RESTABLECER CONTRASEÑA
 */
router.post('/reset-password/:token', resetLimiter, async (req, res) => {
  try {
    const token = str(req.params.token);
    const password = str(req.body.password);

    if (!/^[a-f0-9]{40,64}$/i.test(token)) {
      return res.status(400).json({ message: 'El enlace es inválido o ha expirado' });
    }
    if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
      return res.status(400).json({ message: `La contraseña debe tener entre ${MIN_PASSWORD} y ${MAX_PASSWORD} caracteres` });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'El enlace es inválido o ha expirado' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en reset-password:', error.message);
    res.status(500).json({ message: 'Error al actualizar contraseña' });
  }
});

/**
 * 🛠️ RUTAS DE ADMINISTRACIÓN (solo superusuario)
 */
router.get('/users', requireSuper, async (_req, res) => {
  try {
    const users = await User.find({}, '-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

router.delete('/users/:id', requireSuper, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (id === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (userToDelete.isSuperUser) {
      return res.status(403).json({ message: '⛔ No se puede eliminar al SuperAdmin' });
    }

    await userToDelete.deleteOne();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar:', error.message);
    res.status(500).json({ message: 'Error interno al eliminar usuario' });
  }
});

export default router;
