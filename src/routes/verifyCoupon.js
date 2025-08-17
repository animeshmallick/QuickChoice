const Database = require('../internal/database.js')
const Sql = require('../resource/sql.js');
const express = require('express');
const token = require('../internal/token');
const {isValidCoupon} = require('../helpers/couponHelper.js');
const router = express.Router();
const util = require('../utils/utils.js');


/**
 * @swagger
 * /verifyCoupon/{coupon}:
 *   get:
 *     tags:
 *       - User
 *     summary: Verify is valid coupon
 *     description: Returns a object with status true if coupon is valid.
 *     parameters:
 *       - name: coupon
 *         in: path
 *         required: true
 *         description: Coupons
 *         schema:
 *           type: string
 *           example: REDUCE_FEE
 *     responses:
 *       200:
 *         description: Object with status if valid coupon
 *       400:
 *          description: Invalid coupon
 *       500:
 *         description: Internal server error
 */
router.get('/:coupon', util.verifyStoreName, token.verifyAuthToken,
    function (req, res, next) {
    const coupon = req.params.coupon;
    const customerId = req.customer_id;

    if(!coupon || !customerId) {
        return res.status(400).json({success: false, message: 'Coupon or customer ID missing'});
    }
    if(isValidCoupon(coupon)){
        const database = new Database(req.storename);
        database.query(Sql.get_order_count_from_customer_id(customerId))
            .then(result => {
                console.log(`${result[0].total} orders were placed today by customer ${customerId}`);
                if(result.length === 1 && result[0].total > 0){
                    res.status(200).json({success: true, message: 'Success'});
                }
                else{
                    res.status(400).json({success: false, message: ' Unsuccessful'});
                }
            })
            .catch(err => {
                res.status(500).json({success: false, error: err});
            });
    }
    else{
        return  res.status(400).json({success: false, message: ' Invalid Coupon'});
    }
});

module.exports = router;
