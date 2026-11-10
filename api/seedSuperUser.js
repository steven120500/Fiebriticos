// Uso:
//   SUPERUSER_EMAIL=admin@ejemplo.com SUPERUSER_PASSWORD='una-clave-larga' \
//   SUPERUSER_FIRSTNAME=Nombre SUPERUSER_LASTNAME=Apellido SUPERUSER_PHONE=88888888 \
//   node seedSuperUser.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const {
  SUPERUSER_EMAIL,
  SUPERUSER_PASSWORD,
  SUPERUSER_FIRSTNAME = 'Super',
  SUPERUSER_LASTNAME = 'Admin',
  SUPERUSER_PHONE,
} = process.env;

if (!SUPERUSER_EMAIL || !SUPERUSER_PASSWORD || !SUPERUSER_PHONE) {
  console.error('❌ Define SUPERUSER_EMAIL, SUPERUSER_PASSWORD y SUPERUSER_PHONE (8 dígitos).');
  process.exit(1);
}
if (SUPERUSER_PASSWORD.length < 12) {
  console.error('❌ SUPERUSER_PASSWORD debe tener al menos 12 caracteres.');
  process.exit(1);
}

await connectDB();

const email = SUPERUSER_EMAIL.trim().toLowerCase();

try {
  const hashedPassword = await bcrypt.hash(SUPERUSER_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        username: email,
        email,
        firstName: SUPERUSER_FIRSTNAME,
        lastName: SUPERUSER_LASTNAME,
        phone: SUPERUSER_PHONE,
        password: hashedPassword,
        isSuperUser: true,
        roles: ['add', 'edit', 'delete', 'history'],
      },
    },
    { upsert: true, runValidators: true }
  );
  console.log(`✅ Superusuario listo: ${email}`);
} catch (err) {
  console.error('❌ Error al crear el usuario:', err.message);
} finally {
  await mongoose.disconnect();
}
