module.exports = function parseProductsPerCategoryResults(result){
    const products = {};
    result.forEach(product => {
        const subcategory = product.subcategory;
        // Only pick specific fields
        const cleanedProduct = {
            productId: product.id,
            productName: product.name,
            productSize: product.size,
            productPrice: product.selling_price,
            productMrp: product.mrp,
            productImg: product.image_url,
            productInventory: product.stock
        };

        if(!products[subcategory]){
            products[subcategory] = [cleanedProduct];
        }else{
            products[subcategory].push(cleanedProduct);
        }

    });

    return products;
}
