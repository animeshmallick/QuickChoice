const InvalidCartError = require("../exception/InvalidCartError");
const Bill = require("../constants/bill");
class CartHelper {
    parseCartProducts(result, product_map) {
        result.forEach(product => product['quantity'] = product_map[product.id]);
        return result;
    }

    getProductMap(cart) {
        if(cart.length === 0)
            throw new InvalidCartError("Empty Cart", 404);
        if(this.#is_valid_cart_request(cart)) {
            let product_map = {};
            cart.forEach(item => {
                if(item.Quantity > 0)
                    product_map[item.ProductID] = item.Quantity
            });
            return product_map;
        }else{
            throw new InvalidCartError("Invalid Data in Cart Requests", 403);
        }
    }
    #is_valid_cart_request(cart){
        for (let i = 0; i < cart.length; i++){
            if (!cart[i].hasOwnProperty('ProductID') || !cart[i].hasOwnProperty('Quantity'))
                return false;
        }
        return true;
    }
    #rounded(num) {
        return (Math.round(num * 100) / 100);
    }
    getBill(products,store_bill_details){
        let cart_items_total = 0.00;
        let isCartRestricted = false;
        products.forEach(product => {
            cart_items_total += this.#rounded(product.selling_price * product.quantity);
            if (product.hasOwnProperty('isRestricted') && product.isRestricted === true)
                isCartRestricted = true;
        });
        let delivery_fee = cart_items_total < store_bill_details.min_amount_for_free_delivery ? store_bill_details.delivery_fee : 0;
        let packaging_fee = cart_items_total < store_bill_details.min_amount_for_free_packaging ? store_bill_details.packaging_fee : 0;
        let bill = {
            cart_items_total: this.#rounded(cart_items_total),
            delivery_fee: this.#rounded(delivery_fee),
            packaging_fee: this.#rounded(packaging_fee),
            platform_fee: this.#rounded(store_bill_details.platform_fee),
        };
        if(cart_items_total < store_bill_details.min_amount_for_big_cart)
            bill.small_cart_fee = store_bill_details.small_cart_fee;
        if(isCartRestricted === true)
            bill.restricted_cart_fee = store_bill_details.restricted_cart_fee;

        bill.total_bill = this.#rounded(Object.values(bill).reduce((sum, value) => sum + value, 0));
        return bill;
    }
    createCartBill(allProducts, product_map, store_bill_details){
        return {
            products: this.parseCartProducts(allProducts, product_map),
            bill: this.getBill(this.parseCartProducts(allProducts, product_map), store_bill_details)
        };
    }
}
module.exports = new CartHelper();