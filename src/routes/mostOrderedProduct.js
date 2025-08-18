const express = require('express');
const Database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');
const util = require('../utils/utils.js');

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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product_id:
 *                     type: string
 *               example:
 *                 - product_id: "18"
 *                 - product_id: "9"
 *                 - product_id: "2"
 *                 - product_id: "1"
 *       500:
 *         description: Internal server error
 */


router.get('/', util.verifyStoreName, token.verifyAuthToken, (req, res) => {
    const customerId = req.customer_id;
    const database = new Database(req.storename);
    database.query(Sql.get_most_ordered_product(customerId))
        .then(result => {
            const flatresult = result.flatMap(item=>item.order_id.split('&&'));
            const placeholders = flatresult.map(() => '?').join(',');
            database.query(Sql.get_productId_by_count_from_orderId(placeholders), flatresult)
                .then(result => {
                    console.log(`${result.length} items are most ordered by the customer ${customerId}`);
                    res.status(200).json(result);
                });
        })
        .catch(err => res.status(500).json({error : err}));
});
module.exports = router;