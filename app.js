import express from 'express';
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';


const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto 8080. ${PORT}`);
});