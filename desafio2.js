const fs = require('fs');


class ProductManager {
    constructor(path) {
        this.path = path;
        if (fs.existsSync(path) == false) {
            fs.writeFileSync(path, JSON.stringify([]));
        };
    }
    static getNewId(lastProduct) {
        if (!lastProduct) {
            return 1;
        } else {
            return lastProduct.id + 1;
        }
    }
    async getProducts() {
        let products = await fs.promises.readFile(this.path, 'utf-8');
        return JSON.parse(products);
    }
    async addProduct(title, description, price, thumbnail, code, stock) {
        let products = await this.getProducts();
        let codes = products.map(p => p.code)

        if (codes.includes(code)) {
            console.log('Este producto ya existe');
            return;
        }
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.error('Complete todos los campos');
            return
        }
        let lastProduct = products[products.length - 1]
        let newId = ProductManager.getNewId(lastProduct);
        products.push({ title: title, description: description, price: price, thumbnail: thumbnail, code: code, stock: stock, id: newId });
        fs.writeFileSync(this.path, JSON.stringify(products));
    }

    async getProductById(id) {
        let products = await this.getProducts();
        let product = products.find(p => p.id === id);
        if (product) {
            return product;
        }
        console.error('No existe el producto');
    }
    async updateProduct(id, updatedProduct) {
        let products = await this.getProducts();
        let productIndex = products.findIndex(p => p.id == id);
        products[productIndex] = { ...products[productIndex], ...updatedProduct };
        await fs.promises.writeFile(this.path, JSON.stringify(products));
    }
    async deleteProduct(id) {
        let products = await this.getProducts();
        let productIndex = products.findIndex(p => p.id == id);
        products.splice(productIndex, 1);
        await fs.promises.writeFile(this.path, JSON.stringify(products));
    }
}
//testing 

(async function main() {
    try {
        const productManager = new ProductManager('./productos.txt');
        
        //productos para el testing del método addProduct
        await productManager.addProduct('Jarrón', 'Jarrón de cerámica pintado', 200, 'https://cdn.pixabay.com/photo/2016/04/22/16/17/daisies-1346049_1280.jpg', 'a1', 25);
        await productManager.addProduct('Alfombra', 'Alfombra blanca 3x3', 700, 'https://cdn.pixabay.com/photo/2013/09/21/14/30/sofa-184551_1280.jpg', 'a2', 25);
        await productManager.addProduct('Lámpara', 'Lámpara retro 1,75m de alto', 400, 'https://cdn.pixabay.com/photo/2016/09/11/17/36/lampshade-1662065_1280.jpg', 'a3', 25);
        await productManager.addProduct('Mesa de TV', 'Mesa vintage de TV con cajones', 900, 'https://cdn.pixabay.com/photo/2016/04/18/13/53/room-1336497_1280.jpg', 'a4', 25);
       
       //productos de prueba con un mismo código
        await productManager.addProduct('producto prueba', 'Este es un producto prueba', 200, 'sin imagen', '3333', 25);
        await productManager.addProduct('producto prueba', 'Este es un producto prueba', 200, 'sin imagen', '3333', 25);
        
        //getProducts
        let resultProducts = await productManager.getProducts();
        console.log(resultProducts);
        
        //getProductsById
        console.log(await productManager.getProductById(1));
        productManager.getProductById(5);

        //updateProduct
        await productManager.updateProduct(2, { price: 50 });
        console.log(await productManager.getProductById(2));
        
        //deleteProduct
        await productManager.deleteProduct(1)
        console.log(await productManager.getProducts());
    } catch (err) {
        console.error(err);
    }
})();