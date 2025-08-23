const Sql = require("../resource/sql");
class GetAllPurchase {
    async #getPhoneNumber(database, storename, userid) {
        return database.query(Sql.get_user_phoneNumber_query(), [userid])
            .then(result => {
                return result[0]?.phone || 'N/A';
            })
            .catch(err => {
                console.error("Error executing SQL query:", err);
                return 'Error';
            });
    }

    async #getAddressFormatted(database, storename, address_id){
        return database.query(Sql.get_user_address_query(), [address_id])
            .then(result => {
                const address = result[0];
                return address ? `${address.addr_line1} || ${address.addr_line2}` : 'N/A';
            })
            .catch(err => {
                console.error("Error executing SQL query:", err);
                return 'Error';
            });
    }
    async createPurchaseWrapper(database, storename, raw_purchase) {
        let purchaseWrapper = [];
        for (const purchase of raw_purchase) {
            purchaseWrapper.push({
                purchase_id: purchase.purchase_id,
                phone: await this.#getPhoneNumber(database, storename, purchase.customer_id),
                address: await this.#getAddressFormatted(database, storename, purchase.address_id),
                status: purchase.status
            })
        }
        return purchaseWrapper;
    }
}
module.exports = new GetAllPurchase();