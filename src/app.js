import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import productsRouter from './routes/products.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './ProductManager.js';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

const productManager = new ProductManager('src/data/products.json');

const server = http.createServer(app); 

const io = new Server(server);


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, '..', 'public'))); 
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'handlebars');
app.use('/', viewsRouter); 
app.use('/api/products', productsRouter); 

io.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);

    productManager.getProducts().then(products => {
        socket.emit('productsUpdate', products);
    }).catch(err => {
        console.error("Error al enviar productos iniciales:", err);
    });
    
    socket.on('newProduct', async (productData) => {
        try {
            const newProduct = await productManager.addProduct(productData);
            if (newProduct) {
                const updatedProducts = await productManager.getProducts();
                io.emit('productsUpdate', updatedProducts);
            }
        } catch (error) {
            console.error("Error al añadir producto:", error);
            socket.emit('error', 'Error al crear producto: ' + error.message);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            const idToDelete = parseInt(productId);
            const wasDeleted = await productManager.deleteProduct(idToDelete);
            
            if (wasDeleted) {
                const updatedProducts = await productManager.getProducts();
                io.emit('productsUpdate', updatedProducts);
            } else {
                 socket.emit('error', `Producto con ID ${productId} no encontrado.`);
            }
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            socket.emit('error', 'Error interno al eliminar producto.');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log(`Servidor Socket.io escuchando en el puerto ${PORT}`);
});
