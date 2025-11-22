import { Router } from 'express'
import ProductManager from '../ProductManager.js'

const router = Router();
const cartManager = new ProductManager('src/data/carts.json');
const productManager = new ProductManager('src/data/products.json');

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();

       
        res.render('home', {
            title: "Lista de Productos Estática",
            products: products, 
       
        });
    } catch (error) {
        console.error("Error al obtener productos para la vista home:", error);
        res.status(500).send("Error interno del servidor al cargar la vista.");
    }
});


router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();

        res.render('realTimeProducts', {
            title: "Productos en Tiempo Real",
            products: products, 
            
        });
    } catch (error) {
        console.error("Error al obtener productos para la vista realTimeProducts:", error);
        res.status(500).send("Error interno del servidor al cargar la vista en tiempo real.");
    }
});

export default router;

