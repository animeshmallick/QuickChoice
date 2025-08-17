const express = require('express');
const database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');

const router = express.Router();

/**
 * @swagger
 * /mostOrderedProduct:
 *   get:
 *     tags:
 *       - User
 *     summary: Get the list of product id of most ordered product
 *     description: Returns a object with most ordered product id.
 *     responses:
 *       200:
 *         description: Successfully fetched the most ordered productIDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                   - product_id: "18"
 *                   - product_id: "9"
 *                   - product_id: "2"
 *                   - product_id: "1"
 */

router.get('/', token.verifyAuthToken, (req, res) => {
    const customerId = req.customer_id;
    database.query(Sql.get_most_ordered_product(customerId))
        .then(result => {
            console.log(result);
            const flatresult = result.flatMap(item=>item.order_id.split('&&'));
            console.log(flatresult);
            const placeholders = flatresult.map(() => '?').join(',');
            database.query(Sql.get_productId_by_count_from_orderId(placeholders), flatresult)
                .then(result => {
                    console.log('Product count:', result);
                    res.status(200).json(result);
                });
        });
});
module.exports = router;