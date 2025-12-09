import { Router } from 'express'
import ProductDAO from '../ProductDAO.js'
import CartDAO from '../CartDAO.js';

const router = Router();
const productDAO = new ProductDAO();
const cartDAO = new CartDAO();

router.get('/', async (req, res) => {
    try {
        const productsData = await productDAO.getProducts({ limit: 100 });
        const products = productsData && productsData.payload ? productsData.payload : [];

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
        const productsData = await productDAO.getProducts({ limit: 100 });
        const products = productsData && productsData.payload ? productsData.payload : [];

        res.render('realTimeProducts', {
            title: "Productos en Tiempo Real",
            products: products,
        });
    } catch (error) {
        console.error("Error al obtener productos para la vista realTimeProducts:", error);
        res.status(500).send("Error interno del servidor al cargar la vista en tiempo real.");
    }
});

router.get('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartDAO.getCartById(cid);

        if (!cart) {
            return res.status(404).render('error', {
                title: "Error 404",
                message: `Carrito con ID ${cid} no encontrado.`,
            });
        }
        
        const productsWithDetails = await Promise.all(
            (cart.products || []).map(async (item) => {
                const productDetail = await productDAO.getProductById(item.product);
                return {
                    id: item.product,
                    quantity: item.quantity,
                    title: productDetail ? productDetail.title : 'Producto Desconocido',
                    price: productDetail ? productDetail.price : 0,
                };
            })
        );


        res.render('cart', {
            title: `Contenido del Carrito #${cid}`,
            cartId: cid,
            products: productsWithDetails,
            isEmpty: productsWithDetails.length === 0
        });

    } catch (error) {
        console.error(`Error al obtener el carrito ID ${cid}:`, error);
        res.status(500).send("Error interno del servidor al cargar la vista del carrito.");
    }
});

export default router;

