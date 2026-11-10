// src/auth.js
// Helpers de sesión. El backend valida el token y los permisos en cada petición:
// lo que se guarda aquí solo sirve para mostrar/ocultar la interfaz.

export function getStoredUser() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    // Sesiones antiguas sin token ya no sirven contra el backend
    return u && typeof u === 'object' && typeof u.token === 'string' ? u : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return getStoredUser()?.token || null;
}

export function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}
