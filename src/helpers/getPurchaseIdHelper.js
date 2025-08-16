const util = require('../utils/utils.js');
class GetPurchaseIdHelper {
    getPurchaseID(){
        return `PID-${util.getDateTimeString()}-${util.getRamdomString()}`;
    }
    getOrderID(pid){
        return `OID-${util.getDateTimeString()}-${pid.split('-')[2]}-${util.getRamdomString()}`;
    }
}
module.exports = new GetPurchaseIdHelper();