import * as fs from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class ProductManager {
    constructor(relativePath) {
        this.path = path.join(__dirname, '..', '..', relativePath);
    }

    async readProducts() {
        try {
            if (fs.existsSync(this.path)) {
                const data = await fs.promises.readFile(this.path, 'utf-8');
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            console.log("Error al leer productos", error);
            throw new Error("No se pudo leer la base de datos de productos.");
        } 
    }

    async writeProducts(products) {
        try {
            const dir = path.dirname(this.path);
            await fs.promises.mkdir(dir, { recursive: true });
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        } catch (error) {
            console.error("Error al escribir productos:", error);
            throw new Error("No se pudo guardar la base de datos de productos.")
        }
    }


    async getProducts() {
        return await this.readProducts();
    }


    async getProductById(pid) {
        const products = await this.readProducts();
        const product = products.find(p => p.id === pid);
        return product;
    }

    async addProduct(productData) {
        const { title, description, code, price, stock, category, thumbnails } = productData;

        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error("Faltan campos obligatorios");
        }

        const products = await this.readProducts();

        if (products.some(p => p.code === code)) {
            throw new Error (`Ya existe un producto con el codigo ${code}`);
        }

        const newProduct = {
            id: randomUUID(),
            title,
            description,
            code,
            price: Number(price),
            status: true,
            stock: Number(stock),
            category,
            thumbnails: thumbnails || [],
        };

        products.push(newProduct);
        await this.writeProducts(products);
        return newProduct;
    
    }

    async updateProduct(pid, updatedFields) {
        const products = await this.readProducts();
        const index = products.findIndex(p => p.id === pid);

        if (index === -1) {
            return null;
        }

        delete updatedFields.id;

        if (updatedFields.code && products.some((p, i) => p.code === updatedFields.code && i !==index)) {
            throw new Error(`El codigo ${updatedFields.code} ya esta en uso por otro producto.`);
        }

        products[index] = { ...products[index], ...updatedFields };
        await this.writeProducts(products);
        return products[index];

    }

    async deleteProduct(pid) {
        const products = await this.readProducts();
        const initialLength = products.length;
        const filteredProducts = products.filter(p => p.id !==pid);

        if (filteredProducts.length === initialLength) {
            return false;
        }

        await this.writeProducts(filteredProducts);
        return true;
    }

}