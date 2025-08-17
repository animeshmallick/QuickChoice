const Database = require('../internal/database');
const Sql = require('../resource/sql');
const express = require('express');
const GetAllProductsHelper = require("../helpers/getAllProducts");
const util = require('../utils/utils.js');

const router = express.Router();

/**
 * @swagger
 * /getAllProducts:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all products from database
 *     description: Returns a list of all products formatted for better searchability.
 *     responses:
 *       200:
 *         description: A list of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: string
 *                     example: "PROD12345"
 *                   name:
 *                     type: string
 *                     example: "Organic Apple"
 *                   category:
 *                     type: string
 *                     example: "Fruits"
 *                   brand:
 *                     type: string
 *                     example: "FreshFarm"
 *                   price:
 *                     type: number
 *                     example: 99.99
 *                   imageUrl:
 *                     type: string
 *                     example: "https://example.com/images/apple.jpg"
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.get("/", util.verifyStoreName, function (req, res, next) {
    const database = new Database(req.storename);
    database.query(Sql.get_all_products())
        .then(sql_response =>{
            res.status(200).json(GetAllProductsHelper.parseResultForBetterSearch(sql_response));
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});
module.exports = router;
