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
for (const key of ['MONGO_URI', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`❌ ERROR FATAL: La variable ${key} no está definida en el .env`);
    process.exit(1);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ ERROR FATAL: JWT_SECRET debe tener al menos 32 caracteres aleatorios');
  process.exit(1);
}

const isProd = process.env.NODE_ENV === 'production';

const app = express();

/* -------- CONFIGURACIÓN DE SEGURIDAD Y OPTIMIZACIÓN -------- */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.disable('x-powered-by');                
app.set('json spaces', 0);                  
app.set('trust proxy', 1);                  
app.use(compression());                     
app.use(morgan(isProd ? 'combined' : 'dev'));                     

/* -------- CONFIGURACIÓN DE CORS (A PRUEBA DE BALAS) -------- */
app.use(cors({
  origin: [
    ...(isProd ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173']),
    'https://fiebriticos-catalogo.onrender.com',
    'https://fiebriticos.onrender.com',
    'https://fiebriticoscr.com',       // 👈 Tu nuevo dominio oficial
    'https://www.fiebriticoscr.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

/* -------- CONFIGURACIÓN DE PESO (ARREGLO PARA LOCAL Y FOTOS) -------- */
// Límite suficiente para varias fotos en base64, sin abrir la puerta a cuerpos gigantes
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: false }));

/* -------- RUTAS DE LA API -------- */
app.use('/api/auth', authRoutes);
app.use('/api', pdfRoutes);
app.use('/api/products', productRoutes);
app.use('/api/history', historyRoutes); 

app.get('/', (req, res) => res.send('⚽ BACKEND FIEBRITICOS ONLINE Y CONECTADO 🚀'));

// 2. Middleware Global de Errores
app.use((err, req, res, next) => {
  console.error("💥 Error Detectado:", err.stack);
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  // No exponemos detalles internos al cliente
  res.status(status).json({
    error: status === 500 ? 'Error interno en los vestuarios' : (err.expose ? err.message : 'Solicitud inválida'),
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