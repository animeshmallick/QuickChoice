const PurchaseStatus = require('../constants/PurchaseStatus.js');
class ChangePurchaseStatusHelper {
    isStatusChangeAllowed(oldStatus, newStatus){
        if(oldStatus === PurchaseStatus.PLACED)
            return (newStatus === PurchaseStatus.CONFIRMED || newStatus === PurchaseStatus.CANCELLED);
        else if(oldStatus === PurchaseStatus.CONFIRMED)
            return (newStatus === PurchaseStatus.PACKAGING_IN_PROGRESS || newStatus === PurchaseStatus.CANCELLED);
        else if(oldStatus === PurchaseStatus.PACKAGING_IN_PROGRESS)
            return (newStatus === PurchaseStatus.READY_TO_SHIP || newStatus === PurchaseStatus.CANCELLED);
        else if(oldStatus === PurchaseStatus.READY_TO_SHIP)
            return (newStatus === PurchaseStatus.OUT_FOR_DELIVERY || newStatus === PurchaseStatus.CANCELLED);
        else if(oldStatus === PurchaseStatus.OUT_FOR_DELIVERY)
            return (newStatus === PurchaseStatus.DELIVERED_WITH_PAYMENT_SUCCESS ||
                newStatus === PurchaseStatus.DELIVERED_WITH_PAYMENT_PENDING ||
                newStatus === PurchaseStatus.CANCELLED);
        else if(oldStatus === PurchaseStatus.CANCELLED)
            return (newStatus === PurchaseStatus.PLACED);
        else
            return false
    }
}
module.exports = new ChangePurchaseStatusHelper();