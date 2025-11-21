import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductManager {
    constructor(filePath) { 
        this.path = path.join(__dirname, '..', filePath); 
        this.lastId = 0;
        this.init(); 
    }

    async init() {
        try {
            const dirPath = path.dirname(this.path);
            
           
            await fs.mkdir(dirPath, { recursive: true });
            await fs.access(this.path);
            
            const products = await this.readProductsFile();
            if (products.length > 0) {
                this.lastId = Math.max(...products.map(p => p.id));
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                 await fs.writeFile(this.path, JSON.stringify([], null, 2));
            } else {
                console.error("Error al inicializar ProductManager:", error);
            }
        }
    }

    async readProductsFile() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            if (!data) return [];
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async writeProductsFile(products) {
        try {
            await fs.writeFile(this.path, JSON.stringify(products, null, 2));
        } catch (error) {
            console.error('[ProductManager] Error al escribir en el archivo:', error);
            throw new Error("No se pudo guardar la información del producto.");
        }
    }

    async getProducts() {
        return this.readProductsFile();
    }

    async getProductById(id) {
        const products = await this.readProductsFile();
        const productId = parseInt(id); 
        return products.find(p => p.id === productId) || null;
    }

    
    async addProduct(product) {
        const products = await this.readProductsFile();
        
        if (!product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
            throw new Error("Todos los campos obligatorios (title, description, price, code, stock, category) son requeridos.");
        }

        
        if (products.some(p => p.code === product.code)) {
            throw new Error(`El código '${product.code}' ya está en uso.`);
        }

        this.lastId++;
        const newProduct = {
            id: this.lastId,
            status: true, 
            thumbnails: product.thumbnails || [],
            ...product
        };

        products.push(newProduct);
        await this.writeProductsFile(products);
        return newProduct;
    }

    async updateProduct(id, updatedFields) {
        const products = await this.readProductsFile();
        const productId = parseInt(id);
        const index = products.findIndex(p => p.id === productId);

        if (index === -1) {
            return null; 
        }

        
        delete updatedFields.id;
        
        if (updatedFields.code && products.some((p, i) => p.code === updatedFields.code && i !== index)) {
            throw new Error(`El código '${updatedFields.code}' ya está en uso por otro producto.`);
        }

        const oldProduct = products[index];
        const updatedProduct = {
            ...oldProduct,
            ...updatedFields,
            id: oldProduct.id, 
        };

        products[index] = updatedProduct;
        await this.writeProductsFile(products);
        return updatedProduct;
    }
    
    async deleteProduct(id) {
        const products = await this.readProductsFile();
        const productId = parseInt(id);
        const initialLength = products.length;
        
        const updatedProducts = products.filter(p => p.id !== productId);

        if (updatedProducts.length < initialLength) {
            await this.writeProductsFile(updatedProducts);
            return true; 
        }
        return false; 
    }
}

export default ProductManager;