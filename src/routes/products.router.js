import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';


const router = Router();

const productManager = new ProductManager('src/data/products.json');


router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json({ status: "success", payload: products });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    
    }  
});


router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await productManager.getProductById(pid);
        if (product) {
            res.json({ status: "success", payload: product });
        } else {
            res.status(404).json({ status: "error", message: `Producto con id ${pid} no encontrado` });
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }    
});


router.post('/', async (req, res) => {
    
    const productData = req.body;
    try {
        const newProduct = await productManager.addProduct(productData);
        res.status(201).json({ status: "success", payload: newProduct});
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });

    }

});


router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const updatedFields = req.body;
    try {
        const updatedProduct = await productManager.updateProduct(pid, updatedFields);
        if (updatedProduct) {
            res.json({status: "success", payload: updatedProduct});
        } else {
            res.status(404).json({status: "error", message: `Producto con id ${pid} no encontrado.`});
        }

    }catch (error) {
        res.status(400).json({status:"error", message: error.message });
    }
});  


router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const wasDeleted = await productManager.deleteProduct(pid);
        if (wasDeleted) {
            res.json({ status: "success", message: `Producto con id ${pid} eliminado.`});

        } else {
            res.status(404).json({status: "error", message: `Producto con id ${pid} no encontrado.`});
        }
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
    
});

export default router;

    


