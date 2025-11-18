const socket = io();

const productsList = document.getElementById('products-list');
const addProductForm = document.getElementById('addProductForm');
const deleteProductForm = document.getElementById('deleteProductForm');

/**
 
 * @param {Array<Object>} products 
 */
function renderProducts(products) {
    if (!productsList) return; 

    productsList.innerHTML = ''; 

    if (products.length === 0) {
        productsList.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos disponibles.</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.title}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>${product.code}</td>
            <td>
                <!-- Botón de eliminar (usa el ID del producto) -->
                <button type="button" class="btn btn-danger btn-sm" onclick="emitDeleteProduct(${product.id})">
                    Eliminar
                </button>
            </td>
        `;
        productsList.appendChild(row);
    });
}


socket.on('productsUpdate', (products) => {
    console.log("Datos actualizados recibidos del servidor.");
    renderProducts(products);
});

if (addProductForm) {
    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();

        
        const formData = new FormData(addProductForm);
        const product = {};
        formData.forEach((value, key) => {
            product[key] = key === 'price' || key === 'stock' ? Number(value) : value;
        });

        
        socket.emit('newProduct', product);

        addProductForm.reset();
    });
}



window.emitDeleteProduct = function(id) {
   
    socket.emit('deleteProduct', id);
};


if (deleteProductForm) {
    deleteProductForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const productId = document.getElementById('productIdToDelete').value;
        if (productId) {
             
            emitDeleteProduct(parseInt(productId));
            deleteProductForm.reset();
        }
    });
}

console.log("realTimeProducts.js cargado y conectado a Socket.io.");