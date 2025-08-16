const database = require('../internal/database.js');
const CategoryHelper = require('../helpers/categoriesHelper.js');
const Sql = require('../resource/sql.js');
const express = require('express');

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all categories as a list, for all products in database
 *     description: Retrieves all unique categories from all products in the database.
 *     responses:
 *       200:
 *         description: Successfully fetched unique categories from all products in the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 fruits:
 *                   - product_id: "1"
 *                     name: "Apple"
 *                     price: 120
 *                     image: "https://example.com/images/apple.jpg"
 *                   - product_id: "2"
 *                     name: "Banana"
 *                     price: 40
 *                     image: "https://example.com/images/banana.jpg"
 *                 vegetables:
 *                   - product_id: "3"
 *                     name: "Tomato"
 *                     price: 30
 *                     image: "https://example.com/images/tomato.jpg"
 *       500:
 *         description: Server/database error while fetching categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/', function (req, res, next){
    database.query(Sql.get_all_products())
        .then(result => {
            res.status(200).json(CategoryHelper.parseCategoryResult(result));
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});
module.exports = router;