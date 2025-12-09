import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/backendII';

mongoose.connect(uri)
  .then(() => {
    console.log('OK: conectado a', uri);
    return mongoose.disconnect();
  })
  .then(()=> process.exit(0))
  .catch(err => {
    console.error('ERROR conectando a', uri);
    console.error(err);
    process.exit(1);
  });
