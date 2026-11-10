// api/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const VALID_ROLES = ['add', 'edit', 'delete', 'history'];

function getToken(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
}

/**
 * Si hay un JWT válido, carga el usuario desde la BD (roles siempre frescos,
 * nunca confiamos en lo que diga el token o el cliente) y lo deja en req.user.
 * No rechaza la petición si no hay token.
 */
export async function attachUser(req, _res, next) {
  const token = getToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(payload.id).lean();
    if (user) {
      req.user = {
        id: String(user._id),
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || user.username,
        email: user.email,
        roles: Array.isArray(user.roles) ? user.roles : [],
        isSuperUser: user.isSuperUser === true,
      };
    }
  } catch {
    // token inválido o expirado: se trata como anónimo
  }
  next();
}

/** Exige sesión válida. */
export async function requireAuth(req, res, next) {
  await attachUser(req, res, () => {});
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  next();
}

/** Exige que el usuario tenga el rol indicado (o sea superusuario). */
export function requireRole(role) {
  return (req, res, next) =>
    requireAuth(req, res, () => {
      if (req.user.isSuperUser || req.user.roles.includes(role)) return next();
      return res.status(403).json({ message: 'No tienes permiso para esta acción' });
    });
}

/** Exige superusuario. */
export function requireSuper(req, res, next) {
  return requireAuth(req, res, () => {
    if (req.user.isSuperUser) return next();
    return res.status(403).json({ message: 'Solo el superadministrador puede hacer esto' });
  });
}
