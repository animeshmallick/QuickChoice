const Database = require('../internal/database.js')
const productHelper = require('../helpers/productHelper.js');
const Sql = require('../resource/sql.js');
const express = require('express');
const logger = require('../utils/logger.js');
const util = require('../utils/utils.js');

const router = express.Router();

/**
 * @swagger
 * /product/{productId}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get product details by product ID
 *     description: Fetches a product’s details using its unique product ID.
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: Unique ID of the product
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product_id:
 *                   type: string
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Surf Excel Matic Detergent
 *                 category:
 *                   type: string
 *                   example: Cleaning Supplies
 *                 brand:
 *                   type: string
 *                   example: Hindustan Unilever
 *                 price:
 *                   type: number
 *                   example: 229.00
 *                 unit:
 *                   type: string
 *                   example: 1kg
 *                 image:
 *                   type: string
 *                   example: https://cdn.example.com/products/PRD12345.jpg
 *       400:
 *         description: Invalid product ID
 *       500:
 *         description: Internal server error
 */
router.get('/:productId', util.verifyStoreName, function (req, res, next){
    const productId = req.params.productId;
    const database = new Database(req.storename);
    database.query(Sql.get_product_from_productId(productId))
        .then(sql_response => {
            if(productHelper.validateProduct(sql_response)){
                res.status(200).json(productHelper.parseProduct(sql_response[0]));
            }else{
                res.status(400).json({error: "Invalid ProductId"});
            }
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});

module.exports = router;
