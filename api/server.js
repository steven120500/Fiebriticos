import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet'; 
import morgan from 'morgan'; 
import connectDB from './config/db.js';

// --- RUTAS ---
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js'; 
import historyRoutes from './routes/historyRoutes.js'; 

dotenv.config();

// 1. Verificación proactiva de variables
if (!process.env.MONGO_URI) {
  console.error('❌ ERROR FATAL: La variable MONGO_URI no está definida en el .env');
  process.exit(1);
}

const app = express();

/* -------- CONFIGURACIÓN DE SEGURIDAD Y OPTIMIZACIÓN -------- */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.disable('x-powered-by');                
app.set('json spaces', 0);                  
app.set('trust proxy', 1);                  
app.use(compression());                     
app.use(morgan('dev'));                     

/* -------- CONFIGURACIÓN DE CORS (A PRUEBA DE BALAS) -------- */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://fiebriticos-catalogo.onrender.com',
    'https://fiebriticos.onrender.com',
    'https://fiebriticoscr.com',       // 👈 Tu nuevo dominio oficial
    'https://www.fiebriticoscr.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user', 'x-super', 'x-roles'],
  credentials: true,
}));

/* -------- CONFIGURACIÓN DE PESO (ARREGLO PARA LOCAL Y FOTOS) -------- */
// 🚀 JUGADA MAESTRA: Aumentamos los límites a 50mb para que no falle al subir fotos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* -------- RUTAS DE LA API -------- */
app.use('/api/auth', authRoutes);
app.use('/api', pdfRoutes);
app.use('/api/products', productRoutes);
app.use('/api/history', historyRoutes); 

app.get('/', (req, res) => res.send('⚽ BACKEND FIEBRITICOS ONLINE Y CONECTADO 🚀'));

// 2. Middleware Global de Errores
app.use((err, req, res, next) => {
  console.error("💥 Error Detectado:", err.stack);
  res.status(500).json({ 
    error: 'Error interno en los vestuarios', 
    message: err.message 
  });
});

// Manejo de rutas 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en el catálogo' });
});

/* -------- INICIO DEL SERVIDOR -------- */
const startServer = async () => {
  try {
    await connectDB();
    console.log("🟢 Conexión exitosa a MongoDB Atlas");

    // 🚀 AJUSTE PARA RENDER: Usar el puerto que ellos dan o el 5001 en local
    const PORT = process.env.PORT || 5001;

    // IMPORTANTE: En Render '0.0.0.0' es obligatorio para que sea visible
    app.listen(PORT, '0.0.0.0', () => { 
      console.log(`✅ Server Fiebriticos corriendo en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

// 4. Captura de errores fuera de las promesas
process.on('unhandledRejection', (err) => {
  console.log('🚩 Error no manejado (Unhandled Rejection):', err.message);
});

startServer();