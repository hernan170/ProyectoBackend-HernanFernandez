const fs = require('fs/promises')
const path = require('path')

const productsPath = path.resolve(__dirname, '..', 'products.json')

class ProductManager {
    constructor() {
        this.path = productsPath;
    }

    async readProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8')
            return JSON.parse(data)
        } catch (error) {
            return [];
        }
    }

    async writeProducts(products) {
        await fs.writeFile(this.path, JSON.stringify(products, null, 2), 'utf-8');
    }

    async getProducts() {
        return this.readProducts();
    }

    async generateId(products) {
        return products.lenght === 0 ? 1 : Math.max(...products.map(p => p.id)) + 1;
    }

    async addProduct(productData) {
        const products = await this.readProducts();
        const newProduct = {
            id: await this.generateId(products), ...productData
        };
        products.push(newProduct)
        await this.writeProducts(products)
        return newProduct; 
    }

    async deleteProduct(id) {
        const products = await this.readProducts()
    }

    async deleteProduct(id) {
        const products = await this.readProducts()
        const initiallenght = products.length
        const updatedProducts = products.filter(p => p.id !== id)
         if (updatedProducts.length === initiallenght) {
            return false;
         }

         await this.writeProducts(updatedProducts)
         return true;
   }


}

module.exports = ProductManager;