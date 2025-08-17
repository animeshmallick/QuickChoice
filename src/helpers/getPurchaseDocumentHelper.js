const Sql = require('../resource/sql.js');
class GetPurchaseDocumentHelper {
    #database;
    constructor(database) {
        this.#database = database;
    }
    async getAddress(address_id){
        return database.query(Sql.get_address(address_id))
            .then(result => {
                if(result.length === 1) {
                    return {
                        address_id: result[0].address_id,
                        address_line_1: result[0].addr_line1,
                        address_line_2: result[0].addr_line2
                    }
                }else{
                    return {address: "Not Found"}
                }
            }).catch(err => {
                return {address: "Not Found", error: err.message}
            })
    }
    async getPayment(payment_id){
        if(payment_id === 'cod')
            return {payment: "Cash on Delivery", payment_id: payment_id};
        return {payment: "Not Found"};
    }
    async getOrders(orders){
        const order_ids = orders.split("&&");
        let order_wrapper = [];

        const orders_from_sql = await database.query(Sql.get_orders(order_ids));
        for(const order of orders_from_sql){
            order_wrapper.push({
                order_id: order.order_id,
                product_id: order.product_id,
                quantity: order.quantity
            });
        }
        return order_wrapper
    }
    findProduct(product_id, all_products){
        for(const product of all_products){
            if(product.id === product_id)
                return product;
        }
        return {product: "Not Found"};
    }
}
module.exports = GetPurchaseDocumentHelper;