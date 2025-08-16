const database = require('../internal/database.js');
const SimilarProductsHelper = require('../helpers/similarProductsHelper.js');
const Sql = require('../resource/sql.js');
const express = require('express');

const router = express.Router();

/**
 * @swagger
 * /similarProducts/{productId}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get similar products by productId
 *     description: Returns a list of similar products based on the provided product ID.
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID of the product to find similar items for
 *         schema:
 *           type: integer
 *           example: 1001
 *     responses:
 *       200:
 *         description: List of similar products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product_id:
 *                     type: integer
 *                     example: 1002
 *                   name:
 *                     type: string
 *                     example: Sprite Bottle 500ml
 *                   brand:
 *                     type: string
 *                     example: Coca-Cola
 *                   price:
 *                     type: number
 *                     example: 35.00
 *                   image:
 *                     type: string
 *                     example: https://cdn.example.com/products/1002.jpg
 *       400:
 *         description: Invalid productId or no similar products found
 *       500:
 *         description: Internal server error
 */
router.get('/:productId', function (req, res, next) {
    const productId = Number(req.params.productId);

    database.query(Sql.get_all_products())
        .then(sql_response => {
            const result = SimilarProductsHelper.getSimilarProducts(sql_response, productId);
            if(result.hasOwnProperty('error'))
                return res.status(400).json({error: result.error});

            const parsedResult = SimilarProductsHelper.parseSimilarProducts(result);
            res.status(200).json(parsedResult);
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});
module.exports = router;