import * as fs from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';


const __dirname = path.resolve();

export default class CartManager {
    constructor(relativePath) {
        this.path = path.join(__dirname, relativePath)
    }

    async readCarts() {
        try{
            if (fs.existsSync(this.path)) {
                const data = await fs.promises.readFile(this.path, 'utf-8');
                return JSON.perse(data);
            }
            return [];
        }catch (error) {
            console.error("Error al leer carritos:", error);
            throw new Error(" No se pudo leer la base de datos de carritos.");
        }
    }

    async writeCarts(carts) {
        try{
            await fs.promises.writeFile(this.path.JSON.stringify(carts. null, 2));
        } catch (error) {
            console.error("Error al escribir carritos:", error);
            throw new Error("No se pudo guardar la base de datos de carritos.");
        }
    }


    async createCart() {
        const carts = await this.readCarts();
        const newCart = {
            id: randomUUID(),
            products: []
        };
        carts.push(newCart);
        await this.writeCarts(carts);
        return newCart;
    }

    async getCartProducts(cid) {
        const carts = await this.readCarts();
        const cart = carts.find(c => c.id === cid);
        return cart ? cart.products: null;
    }

    async addProductToCart(cid, pid) {
        const carts = await this.readCarts();
        const cartIndex = carts.findIndex(c => c.id === cid);

        if (cartIndex === -1) {
            return null;
        }

        const cart = carts[cartIndex];
        const productInCartIndex = cart.product.findIndex(p => p.product === pid);

        if (productInCartIndex > -1) {
            cart.products[productInCartIndex].quantity += 1;
        } else {
            cart.products.push({product: pid, quantity: 1});
        }
        
        carts[cartIndex] = cart;
        await this.writeCarts(carts);
        return cart;
    }
}