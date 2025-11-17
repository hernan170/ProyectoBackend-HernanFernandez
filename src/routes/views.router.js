const { Router } = require('express')
const ProductManager = require('../ProductManager.')

const viewsRouter = Router()
const productManager = new ProductManager()


viewsRouter.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts()
    res.render('home', {
        title: 'Lista de Productos (Home',
        products: products,
        hasProducts: products.length > 0
    });
  } catch (error) {
    console.error('Error al renderizar home:', error);
    res.status(500).render('error', { message: 'No se pudo cargar la lista de productos'})
  }

});

viewsRouter.get('realTimeProducts', async (req, res) => {
    try {
        const products = await productManager.getProducts()
        res.render('realTimeProducts', {
            title: 'Productos en tiempo real',
            products: products,
            hasProducts: products.length > 0
        });
    } catch (error) {
        console.error('Error al rnderizar realTimeProducts:', error)
        res.status(500).render('error', { message: 'No se pudo cargar la vista de tiempo real.'})
    }
});

module.esports = viewsRouter;