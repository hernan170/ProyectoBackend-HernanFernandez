import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';


import ProductDAO from './ProductDAO.js'
import cartRouter from './routes/carts.router.js';
import productRouter from './routes/products.router.js';
import viewsRouter from './routes/views.router.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/backendII';

let productDAO;


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.engine('handlebars', handlebars.engine({
    helpers: {
        multiply: (a, b) => {
            const na = Number(a) || 0;
            const nb = Number(b) || 0;
            return (na * nb).toFixed(2);
        }
    }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, '..', 'public')));

const httpServer = http.createServer(app);

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Conectado a la base de datos MongoDB');
        productDAO = new ProductDAO();

        // Socket.IO setup
        const io = new SocketIOServer(httpServer);
        io.on('connection', async (socket) => {
            console.log('Cliente conectado (Socket.IO)');
            try {
                const all = await productDAO.getProducts({ limit: 100 });
                socket.emit('productsUpdate', all.payload || []);
            } catch (err) {
                console.error('Error al enviar lista inicial de productos:', err);
            }

            socket.on('newProduct', async (product) => {
                try {
                    await productDAO.addProduct(product);
                    const all = await productDAO.getProducts({ limit: 100 });
                    io.emit('productsUpdate', all.payload || []);
                } catch (err) {
                    console.error('Error al agregar producto vía socket:', err);
                    socket.emit('error', 'No se pudo agregar el producto.');
                }
            });

            socket.on('deleteProduct', async (id) => {
                try {
                    await productDAO.deleteProduct(id);
                    const all = await productDAO.getProducts({ limit: 100 });
                    io.emit('productsUpdate', all.payload || []);
                } catch (err) {
                    console.error('Error al eliminar producto vía socket:', err);
                    socket.emit('error', 'No se pudo eliminar el producto.');
                }
            });
        });

        app.get('/', async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const page = parseInt(req.query.page) || 1;

                const productsData = await productDAO.getProducts({ limit: limit, page: page });

                res.render('home', {
                    products: productsData.payload,
                    style: 'styles.css'
                });
            } catch (error) {
                console.error('Error al obtener productos para la vista:', error);
                res.status(500).render('Error', { message: 'No se pudieron cargar los productos para la vista.'});
            }
        });

        app.use('/', viewsRouter);
        app.use('/api/products', productRouter);
        app.use('/api/carts', cartRouter);

        httpServer.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto: ${PORT}`);
            console.log(`URL: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error conectando a MongoDB:', err);
        process.exit(1);
    });


