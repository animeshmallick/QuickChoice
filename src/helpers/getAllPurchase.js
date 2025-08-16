const util = require('../utils/utils');
class GetAllPurchase {
    async createPurchaseWrapper(raw_purchase) {
        let purchaseWrapper = [];
        for (const purchase of raw_purchase) {
            purchaseWrapper.push({
                purchase_id: purchase.purchase_id,
                phone: await util.getPhoneNumber(purchase.customer_id),
                address: await util.getAddressFormatted(purchase.address_id),
                status: purchase.status
            })
        }
        return purchaseWrapper;
    }
}
module.exports = new GetAllPurchase();