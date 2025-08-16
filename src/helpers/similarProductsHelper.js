const Fuse = require("fuse.js");
class SimilarProductsHelper {
    parseSimilarProducts(products) {
        console.log(products);
        const similarProducts = [];
        products.forEach((product) => {
            const similarProduct = {
                productId: product.id,
                productName: product.name,
                productImg: product.image_url,
                productSize: product.size,
                productPrice: product.selling_price
            };
            similarProducts.push(similarProduct);
        });
        return similarProducts;
    }

    getSimilarProducts(result, productId) {
        const options = {
            includeScore: true,
            keys: ['name', 'description', 'tags', 'category', 'subcategory', 'brand'],
        };

        const referenceProduct = result.find(item => item.id === productId);
        if(!referenceProduct){
            return {error: "Invalid ProductId"};
        }

        const fuse = new Fuse(result, options);
        const searchedProducts = fuse.search(referenceProduct.name);

        const similarProducts  = searchedProducts
            .filter(r => r.item.id !== productId)
            .sort((a, b) => a.score - b.score) // Lower score = more similar
            .map(r => r.item);

        return (similarProducts.slice(0,4));
    }
}
module.exports = new SimilarProductsHelper();
