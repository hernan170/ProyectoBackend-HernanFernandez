import 'dotenv/config';
import mongoose from 'mongoose';
import ProductDAO from './src/ProductDAO.js';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/backendII';

async function run() {
  try {
    console.log('Conectando a MongoDB en:', uri);
    await mongoose.connect(uri);
    console.log('Conectado. Probando paginación...');

    const dao = new ProductDAO();
    const result = await dao.getProducts({ limit: 5, page: 1 });
    console.log('Resultado de paginación:');
    console.dir(result, { depth: 4 });

    await mongoose.disconnect();
    console.log('Desconectado. Test finalizado.');
    process.exit(0);
  } catch (err) {
    console.error('Error en test-paginate:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
