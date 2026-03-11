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

dotenv.config();

// Validación de variables esenciales
if (!process.env.MONGO_URI) {
  console.error('❌ ERROR FATAL: La variable MONGO_URI no está definida en el .env');
  process.exit(1);
}

const app = express();

/* -------- CONFIGURACIÓN DE SEGURIDAD Y OPTIMIZACIÓN -------- */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permite cargar imágenes de otros dominios
}));
app.disable('x-powered-by');                
app.set('json spaces', 0);                  
app.set('trust proxy', 1);                  
app.use(compression());                     
app.use(morgan('dev'));                     

/* -------- CONFIGURACIÓN DE CORS -------- */
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://fiebriticos-catalogo.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (como Postman o apps móviles) o si está en la lista blanca
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`🚩 Bloqueado por CORS: ${origin}`);
      callback(new Error('No permitido por la política de seguridad CORS de Fiebriticos'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user'], // Importante para tu sistema de Admin
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* -------- CONEXIÓN A BASE DE DATOS -------- */
const startServer = async () => {
  try {
    await connectDB();
    console.log("🟢 Conexión exitosa a MongoDB Atlas");

    /* -------- RUTAS DE LA API -------- */
    app.use('/api/auth', authRoutes);
    app.use('/api', pdfRoutes);
    app.use('/api/products', productRoutes);

    app.get('/', (req, res) => res.send('⚽ BACKEND FIEBRITICOS ONLINE Y CONECTADO 🚀'));

    // Manejo de rutas no encontradas
    app.use((req, res) => {
      res.status(404).json({ error: 'Ruta no encontrada en el vestuario' });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server Fiebriticos corriendo en: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

startServer();