const database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
class UserPurchasesHelper {
    async getAddress(address_id){
        if(address_id) {
            const result = await database.query(Sql.get_address(address_id))
            if (result.length === 1) {
                return{
                    address_id: result[0].address_id,
                    address_line1: result[0].addr_line1,
                    address_line2: result[0].addr_line2
                }
            } else {
                return {address: "Not Found"}
            }
        }
    }
    getPayment(payment_id){
        if(payment_id === 'cod')
            return {payment: "Cash on Delivery", payment_id: payment_id};
        return {payment: "Not Found"};
    }
    async parseUserPurchases(result) {
        let parsedPurchases = [];
        for(const purchase of result) {
            let selectedAddress = {};
            let selectedPayment = {};

            if(purchase.address_id !== null && purchase.payment_id !== null){
                const addressObj = await this.getAddress(purchase.address_id);
                if(addressObj && addressObj.hasOwnProperty("address_id")){
                    selectedAddress = addressObj;
                }
                const paymentObj = this.getPayment(purchase.payment_id);
                if(paymentObj && paymentObj.hasOwnProperty("payment_id")){
                    selectedPayment = paymentObj;
                }
            }
            const userPurchase = {
                purchase_id: purchase.purchase_id,
                status: purchase.status,
                placed_on: purchase.placed_on,
                total_quantity: purchase.total_quantity
            };
            if(selectedAddress){
                userPurchase.address = selectedAddress;}
            if(selectedPayment){
                userPurchase.payment = selectedPayment;}

            parsedPurchases.push(userPurchase);
        }
        return parsedPurchases;
    }
}

module.exports = new UserPurchasesHelper();