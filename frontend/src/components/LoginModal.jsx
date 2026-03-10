import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
// 🔹 Corregimos: Separamos los iconos por su familia (Fi y Fa)
import { FiEye, FiEyeOff, FiX, FiPhone, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { FaFutbol } from 'react-icons/fa'; 
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = import.meta.env.VITE_API_URL || "https://fiebriticos.onrender.com";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  
  const [mode, setMode] = useState('login'); 
  const [showPassword, setShowPassword] = useState(false);
  const cardRef = useRef(null);

  const hasUpper  = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasLength = password.length >= 6;
  const isPasswordValid = hasUpper && hasNumber && hasLength;

  useEffect(() => {
    if (isOpen) {
      setFirstName(''); setLastName(''); setEmail(''); 
      setPassword(''); setPhone('');
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= 8) setPhone(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error('Ingresa un correo electrónico válido');
      return;
    }

    try {
      if (mode === 'forgot') {
        const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error();
        toast.success('Enlace enviado. El administrador puede verlo en la consola.');
        setMode('login');
        return;
      }

      const endpoint = mode === 'register' ? 'register' : 'login';
      const payload = mode === 'register' 
        ? { username: email, firstName, lastName, email, phone, password } 
        : { email, password };

      const res = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en la solicitud');

      if (mode === 'register') {
        toast.success('¡Fichaje exitoso! Ya puedes entrar.');
        setMode('login');
      } else {
        const userData = {
          id: data.id,
          username: data.firstName, 
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          roles: data.roles,
          isSuperUser: data.isSuperUser,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        onLoginSuccess?.(userData);
        onClose?.();
        toast.success(`¡Hola, ${data.firstName}! Bienvenido al equipo.`);
      }
    } catch (err) {
      toast.error(err.message || 'Error de conexión');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-fiebriAzul/60 backdrop-blur-md px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-[2.5rem] bg-white shadow-2xl overflow-hidden border-b-8 border-fiebriVerde"
      >
        <div className="bg-fiebriAzul p-8 text-center relative overflow-hidden">
          <FaFutbol className="absolute -top-4 -left-4 text-white/5 text-7xl rotate-12" />
          <button onClick={onClose} className="absolute right-5 top-5 text-white/50 hover:text-fiebriVerde transition-colors">
            <FiX size={24} />
          </button>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            {mode === 'login' && 'Entrar al Club'}
            {mode === 'register' && 'Nuevo Fichaje'}
            {mode === 'forgot' && 'Recuperar Clave'}
          </h2>
          <p className="text-fiebriVerde font-bold text-[10px] uppercase tracking-widest mt-2">Fiebriticos CR</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <AnimatePresence mode='wait'>
            {mode === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-2xl bg-fiebriGris border-none pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-fiebriAzul" />
                  </div>
                  <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-2xl bg-fiebriGris border-none px-4 py-3 text-sm focus:ring-2 focus:ring-fiebriAzul" />
                </div>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Celular (8 dígitos)" value={phone} onChange={handlePhoneChange} className="w-full rounded-2xl bg-fiebriGris border-none pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-fiebriAzul font-bold" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl bg-fiebriGris border-none pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-fiebriAzul" />
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full rounded-2xl bg-fiebriGris border-none pl-11 pr-12 py-3 text-sm focus:ring-2 ${mode === 'register' && password.length > 0 ? (isPasswordValid ? 'ring-2 ring-fiebriVerde' : 'ring-2 ring-red-300') : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fiebriAzul">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 space-y-6">
            <button type="submit" className="boton-fiebri-verde w-full py-4 rounded-2xl text-white font-black text-lg shadow-xl uppercase tracking-tighter italic">
              {mode === 'login' && '¡Entrar a la Cancha!'}
              {mode === 'register' && 'Confirmar Fichaje'}
              {mode === 'forgot' && 'Enviar Instrucciones'}
            </button>

            <div className="text-center space-y-2">
              {mode === 'login' ? (
                <>
                  <p className="text-xs text-gray-400 font-medium">¿Aún no tienes cuenta?</p>
                  <button type="button" onClick={() => setMode('register')} className="text-fiebriAzul font-black uppercase tracking-widest text-[10px] hover:text-fiebriVerde transition-colors">Crear Cuenta Nueva</button>
                </>
              ) : (
                <button type="button" onClick={() => setMode('login')} className="text-fiebriAzul font-black uppercase tracking-widest text-[10px] hover:text-fiebriVerde transition-colors">Regresar</button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}