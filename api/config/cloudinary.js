// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'; // 👈 1. IMPORTAMOS DOTENV

dotenv.config(); // 👈 2. CARGAMOS LAS VARIABLES (ESTO ES VITAL EN LOCAL)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// OJO: Agrega este log temporal para confirmar que las llaves están cargando
console.log("☁️ Cloudinary configurado para:", process.env.CLOUDINARY_CLOUD_NAME);

export default cloudinary;