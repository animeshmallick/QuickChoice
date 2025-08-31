const Database = require('../internal/database.js')
const Sql = require('../resource/sql.js');
const express = require('express');
const cartHelper = require("../helpers/cart.js");
const util = require('../utils/utils.js');

const router = express.Router();

/**
 * @swagger
 * /cart:
 *   post:
 *     tags:
 *       - User
 *     summary: Calculate a bill for a cart based on selected products and quantities.
 *     description: Accepts a list of ProductID and Quantity objects in the request body and returns a detailed cart with total bill.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 ProductID:
 *                   type: string
 *                   example: "1"
 *                   description: ID of the product
 *                 Quantity:
 *                   type: integer
 *                   example: 2
 *                   description: Quantity of the product
 *     responses:
 *       200:
 *         description: Successfully calculated cart bill
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product_id:
 *                         type: string
 *                         example: "PROD123"
 *                       name:
 *                         type: string
 *                         example: "Apple"
 *                       price:
 *                         type: number
 *                         example: 30
 *                       quantity:
 *                         type: number
 *                         example: 2
 *                       total:
 *                         type: number
 *                         example: 60
 *                 total_price:
 *                   type: number
 *                   example: 150
 *       400:
 *         description: Bad input or missing data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input"
 *       500:
 *         description: Server/database error while fetching product info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/', util.verifyStoreName, function (req, res, next){
    try {
        const database = new Database(req.storename);
        const product_map = cartHelper.getProductMap(req.body);
        database.query(Sql.get_store_details())
            .then(result => {
                const storeDetails = result[0];
                database.query(Sql.get_all_products_in_stock_from_ids(Object.keys(product_map)))
                    .then(result => {
                        const cart_response = cartHelper.createCartBill(result, product_map, storeDetails);
                        res.status(200).json(cart_response);
                    })
                    .catch(err => {
                        res.status(500).json({error: err.message});
                    });
            })
            .catch(err => {
                res.status(500).json({error: err.message});
            });
    }catch (err) {res.status(err.statusCode).json({error: err.message})}
});
module.exports = router;