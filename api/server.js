import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet'; 
import morgan from 'morgan'; 
import connectDB from './config/db.js';

// --- RUTAS (Limpias para catálogo) ---
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js'; 

dotenv.config();

// Validación de variables (Solo dejamos las esenciales)
const requiredEnvs = ['MONGO_URI']; 
requiredEnvs.forEach((env) => {
  if (!process.env[env]) console.warn(`⚠️ FALTA VARIABLE: ${env}`);
});

const app = express();

/* -------- CONFIGURACIÓN -------- */
app.use(helmet());                          
app.disable('x-powered-by');                
app.set('json spaces', 0);                  
app.set('trust proxy', 1);                  
app.use(compression());                     
app.use(morgan('dev'));                     

// CORS: Lista blanca (Actualizada para desarrollo)
const allowedOrigins = [
  'http://localhost:5173',
  'https://fiebriticos-catalogo.onrender.com'
  // Cuando subas el frontend de Fiebriticos a Render o compres el dominio, los agregas aquí:
  // 'https://fiebriticos-frontend.onrender.com',
  // 'https://www.fiebriticos.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite peticiones sin origin (como Postman) o si están en la lista
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    console.error(`Bloqueado CORS: ${origin}`);
    return callback(new Error('Bloqueado por seguridad (CORS)'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* -------- DB & RUTAS -------- */
try { await connectDB(); } catch (e) { console.error("Error DB:", e.message); }

// Solo dejamos autenticación (para el admin), productos y los PDFs
app.use('/api/auth', authRoutes);
app.use('/api', pdfRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => res.send('BACKEND FIEBRITICOS ONLINE 🚀'));
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server Fiebriticos en puerto ${PORT}`));