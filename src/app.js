import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import productsRouter from './routes/products.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './ProductManager.js';
import { fileURLToPath } from 'url';

// Configuración de rutas absolutas para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Instancia única de ProductManager
const productManager = new ProductManager('src/data/products.json');


// 1. Crear servidor HTTP a partir de la app de Express
const server = http.createServer(app); 

// 2. Inicializar Socket.io en el servidor HTTP
const io = new Server(server);

// --- Configuración de Express ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
// Servir archivos estáticos (CSS, JS cliente, etc.)
app.use(express.static(path.join(__dirname, '..', 'public'))); 

// --- Configuración de Handlebars ---
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'handlebars');


// --- Rutas ---
app.use('/', viewsRouter); // Rutas para vistas (Handlebars)
app.use('/api/products', productsRouter); // Rutas para la API REST


// --- Lógica de Socket.io ---
io.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);

    // Enviar la lista inicial de productos solo al cliente que se conecta
    productManager.getProducts().then(products => {
        socket.emit('productsUpdate', products);
    }).catch(err => {
        console.error("Error al enviar productos iniciales:", err);
    });
    
    // Escuchar el evento de creación de producto
    socket.on('newProduct', async (productData) => {
        try {
            // productData viene serializado desde el cliente
            const newProduct = await productManager.addProduct(productData);
            if (newProduct) {
                // Si se añade, obtener la lista actualizada y emitir a TODOS (io.emit)
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
