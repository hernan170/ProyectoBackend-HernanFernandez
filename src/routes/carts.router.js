import { Router } from "express"
import CartManager  from "../CartManager"
import ProductManager from "../ProductManager"

const router = Router()
const cartManager = new CartManager('data/carts.json')
const productManager = new ProductManager('data/products.json')

router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart()
        res.status(201).json({ status: 'success', payload: newCart})
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message})
    }
        
})

router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartManager.getCartById(cid)
        if (cart) {
            res.json({ status: 'success', payload: cart.products})
        } else {
            res.status(400).json({ status: "error", message: `Carrito con ID ${cid} no encontrado`})
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message })
    }
})

router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try { 
        const product = await productManager.getProductById(pid)
        if (!product) {
            return res.json(404).json({ status: "error", message:`Producto con ID ${pid} no existe.`})
        }

        const updatedCart = await cartManager.addProductToCart(cid, pid)
        res.json({ status: "success", payload: updatedCart})
    } catch (error) {
        if (error.message.includes('Carrito')) {
            res.status(404).json({ status: "error", mesage: error.message})
        } else {
            res.status(500).json({ status: "error", message: error.message})
        }    
    }
})

export default router;
    