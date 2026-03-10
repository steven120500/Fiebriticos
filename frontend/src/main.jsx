import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // Configuración de idiomas
import './index.css'; // Estilos globales (Donde vive el Azul y Verde)
import { registerSW } from './registerSW.js';

// 🔹 Un toque de profesionalismo: Log en consola para el staff
console.log(
  "%cFiebriticos CR %c- Sistema de Gestión 2026",
  "color: #4ADE80; font-size: 20px; font-weight: bold; background-color: #1E40AF; padding: 5px 10px; border-radius: 8px;",
  "color: #1E40AF; font-size: 14px; font-weight: bold;"
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 🚀 Registro del Service Worker para funcionamiento Offline y PWA
registerSW();