class ProductHelper{
    parseProduct(product){
        return {
            productId: product.id,
            productName: product.name,
            productDescription: product.description,
            productSize: product.size,
            productPrice: product.selling_price,
            productMrp: product.mrp,
            productImg: product.image_url,
            productSku: product.sku,
            productTags: product.tags,
            productStock : product.stock
        };
    }
    validateProduct(result){
        return result.length === 1;
    }

}
module.exports = new ProductHelper();