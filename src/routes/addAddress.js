const express = require('express');
const database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');
const util = require('../utils/utils.js');

const router = express.Router();

/**
 * @swagger
 * /addAddress:
 *   post:
 *     tags:
 *         - User
 *     summary: Add a new address for the authenticated customer
 *     security:
 *       - xAuthorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addr_line1
 *               - addr_line2
 *             properties:
 *               address_label:
 *                 type: string
 *                 example: "Friends&Family"
 *               addr_line1:
 *                 type: string
 *                 example: "123 Main Street"
 *               addr_line2:
 *                 type: string
 *                 example: "Apt 4B"
 *               city:
 *                 type: string
 *                 example: "Mumbai"
 *               state:
 *                 type: string
 *                 example: "Maharashtra"
 *               pincode:
 *                 type: string
 *                 example: "400001"
 *     responses:
 *       200:
 *         description: Address added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid Authorization Token
 *       403:
 *         description: Authorization Token Missing
 *       500:
 *         description: Server error
 */

router.post('/', token.verifyAuthToken, (req, res) => {
    const customerId = req.customer_id;
    const address = req.body;
    address.address_id = "ADDR" + util.getRamdomString(6);
    if(address.hasOwnProperty("addr_line1") && address.hasOwnProperty("addr_line2") &&
        address.hasOwnProperty("city") && address.hasOwnProperty("pincode") &&
        address.hasOwnProperty("state")){
        database.query(Sql.add_new_address(customerId,address))
            .then(result => {
                res.status(200).json({"success" : "Address added successfully"});
            })
            .catch(err => {
                res.status(500).json({"error": "Something went wrong"});
            });
    }else{
        res.status(400).json({"error": "Something went wrong"});
    }
});
module.exports = router;