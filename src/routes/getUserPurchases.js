const database = require('../internal/database.js')
const Sql = require('../resource/sql.js');
const express = require('express');
const token = require("../internal/token");
const UserPurchasesHelper = require('../helpers/getUserPurchasesHelper.js');

const router = express.Router();

/**
 * @swagger
 * /getUserPurchases:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user's purchase history
 *     description: Retrieves the purchase history of an authenticated user using their customer ID.
 *     security:
 *       - xAuthorization: []
 *     responses:
 *       200:
 *         description: Successfully retrieved purchase history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   purchase_id:
 *                     type: string
 *                     example: "PURCH123"
 *                   product_id:
 *                     type: string
 *                     example: "PROD456"
 *                   quantity:
 *                     type: integer
 *                     example: 2
 *                   purchase_date:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-07-20T14:48:00.000Z"
 *                   status:
 *                     type: string
 *                     example: "DELIVERED"
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error while retrieving purchases
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/', token.verifyAuthToken, (req, res) => {
    const customerId = req.customer_id;
    database.query(Sql.get_user_purchases(customerId))
        .then(async result => {
            res.status(200).json(await UserPurchasesHelper.parseUserPurchases(result));
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});

module.exports = router;