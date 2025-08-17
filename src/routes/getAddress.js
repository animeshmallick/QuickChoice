// routes/getAddress.js
const express = require('express');
const Database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');
const AddressHelper = require('../helpers/getAddressHelper.js');
const util = require('../utils/utils.js');

const router = express.Router();

/**
 * @swagger
 * /getUserAddresses:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all addresses of the authenticated customer
 *     description: Returns a list of all saved addresses for the authenticated customer. Requires Bearer token in `x-authorization` header.
 *     responses:
 *       200:
 *         description: Successfully fetched user's addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   address_id:
 *                     type: string
 *                     example: "ADDR8JKL09"
 *                   addr_line1:
 *                     type: string
 *                     example: "123 Main Street"
 *                   addr_line2:
 *                     type: string
 *                     example: "Apt 4B"
 *                   city:
 *                     type: string
 *                     example: "Mumbai"
 *                   state:
 *                     type: string
 *                     example: "Maharashtra"
 *                   pincode:
 *                     type: string
 *                     example: "400001"
 *       401:
 *         description: Invalid Authorization Token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid Authorization Token"
 *       403:
 *         description: Authorization Token Missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authorization Token Missing"
 *       500:
 *         description: Server/database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/', util.verifyStoreName, token.verifyAuthToken, (req, res) => {
    const customerId = req.customer_id;
    const database = new Database(req.storename);
    const addressHelper = new AddressHelper(database);
    database.query(Sql.get_user_address(customerId))
        .then(async result => {
            const defaultAddress = await addressHelper.get_default_address();
            if(!result || result.length === 0) {
                res.status(200).json({userAddress: [], storeAddress: defaultAddress});
            }else {
                res.status(200).json({
                    userAddress: addressHelper.parseUserAddress(result),
                    storeAddress: defaultAddress
                });
            }
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        });
});

module.exports = router;
