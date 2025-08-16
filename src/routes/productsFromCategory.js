const database = require('../internal/database.js')
const parseProductsPerCategory = require('../helpers/productsFromCategoryHelper.js');
const Sql = require('../resource/sql.js');
const express = require('express');

const router = express.Router();

/**
 * @swagger
 * /category/{category}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get products by category
 *     description: Returns a list of products that belong to the specified category.
 *     parameters:
 *       - name: category
 *         in: path
 *         required: true
 *         description: Category of the products (e.g. Beverages, Snacks, Cleaning)
 *         schema:
 *           type: string
 *           example: Beverages
 *     responses:
 *       200:
 *         description: List of products in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product_id:
 *                     type: string
 *                     example: PRD1001
 *                   name:
 *                     type: string
 *                     example: Sprite Bottle 1L
 *                   brand:
 *                     type: string
 *                     example: Coca-Cola
 *                   price:
 *                     type: number
 *                     example: 65.00
 *                   image:
 *                     type: string
 *                     example: https://cdn.example.com/products/PRD1001.jpg
 *       500:
 *         description: Internal server error
 */
router.get('/:category', function (req, res, next){
    const category = req.params.category;
    database.query(Sql.get_products_from_category(category))
        .then(sql_response => {
            res.status(200).json(parseProductsPerCategory(sql_response));
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});
module.exports = router;