import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FaUser, FaFutbol } from 'react-icons/fa';
import { FiLogOut, FiUserPlus, FiUsers, FiClock, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserDropdown({
  isSuperUser,
  canSeeHistory,
  onLogout,
  onAddUser,
  onViewUsers,
  onViewHistory,
}) {
  // Cerramos el menú simulando el escape
  const closeMenu = () =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

  return (
    <div className="relative">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="group relative flex items-center justify-center rounded-2xl p-3 shadow-xl transition-all bg-fiebriAzul text-white hover:scale-105 border-b-4 border-fiebriVerde active:translate-y-1 active:border-b-0"
            aria-label="User menu"
          >
            <FaUser size={20} className="group-hover:text-fiebriVerde transition-colors" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={12}
            align="end"
            className="bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-3 w-64 z-[100] border-b-8 border-fiebriVerde animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header del Dropdown */}
            <div className="px-4 py-3 mb-2 border-b border-fiebriGris">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FaFutbol className="text-fiebriVerde" /> Panel de Control
              </p>
            </div>

            {/* Opciones solo para Súper Usuario */}
            {isSuperUser && (
              <>
                <DropdownMenu.Item
                  className="outline-none cursor-pointer flex items-center gap-3 p-3 rounded-xl text-fiebriAzul font-bold text-xs uppercase tracking-tight hover:bg-fiebriGris hover:text-fiebriVerde transition-all"
                  onSelect={(e) => { e.preventDefault(); closeMenu(); onAddUser(); }}
                >
                  <div className="bg-fiebriAzul/5 p-2 rounded-lg">
                    <FiUserPlus size={16} />
                  </div>
                  Agregar Usuario
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="outline-none cursor-pointer flex items-center gap-3 p-3 rounded-xl text-fiebriAzul font-bold text-xs uppercase tracking-tight hover:bg-fiebriGris hover:text-fiebriVerde transition-all"
                  onSelect={(e) => { e.preventDefault(); closeMenu(); onViewUsers(); }}
                >
                  <div className="bg-fiebriAzul/5 p-2 rounded-lg">
                    <FiUsers size={16} />
                  </div>
                  Lista de Usuarios
                </DropdownMenu.Item>
              </>
            )}

            {/* Opción de Historial */}
            {canSeeHistory && (
              <DropdownMenu.Item
                className="outline-none cursor-pointer flex items-center gap-3 p-3 rounded-xl text-fiebriAzul font-bold text-xs uppercase tracking-tight hover:bg-fiebriGris hover:text-fiebriVerde transition-all"
                onSelect={(e) => { e.preventDefault(); closeMenu(); onViewHistory(); }}
              >
                <div className="bg-fiebriAzul/5 p-2 rounded-lg">
                  <FiClock size={16} />
                </div>
                Bitácora VAR
              </DropdownMenu.Item>
            )}

            {/* Separador sutil */}
            <div className="h-px bg-fiebriGris my-2 mx-2" />

            {/* Cerrar sesión - Estilo Destacado */}
            <DropdownMenu.Item
              className="outline-none cursor-pointer flex items-center gap-3 p-3 rounded-xl text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
              onSelect={(e) => { e.preventDefault(); closeMenu(); onLogout(); }}
            >
              <div className="bg-red-50 p-2 rounded-lg">
                <FiLogOut size={16} />
              </div>
              Finalizar Sesión
            </DropdownMenu.Item>
            
            <DropdownMenu.Arrow className="fill-white" />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}