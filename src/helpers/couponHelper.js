const coupons = require('../constants/coupons');
function isValidCoupon(coupon){
    return coupon === coupons.REDUCE_FEE;
}

module.exports = {isValidCoupon};