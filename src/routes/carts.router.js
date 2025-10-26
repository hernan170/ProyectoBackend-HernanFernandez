import { Router } from 'express';
import CartManager from '../managers/CartManager.js';


const router = Router();
const cartManager = new CartManager('src/data/carts.json');

router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({ status: "success", payload: newCart });

    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});


router.get ('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const product = await cartManager.getCartProducts(cid);
        if (products !== null) {
            res.json({ status: "success", payload: products });
        } else {
            res.status(404).json({ status: "error", message: `Carrito con id ${cid} no encontrado.`});
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message});
    }
});  


router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const updatedCart = await cartManager.addProductToCart(cid, pid);
        if (updatedCart) {
            res.json({ status: "success", massage: `Producto ${pid} agregado en carrito ${cid}.`, payload: updatedCart});
        } else  {
            res.status(404).json({ status: "error", message: `Carrito con id ${cid} no encontrado.`});
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

export default router;