const express = require('express');
const Database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');
const util = require('../utils/utils.js');


const router = express.Router();

/**
 * @swagger
 * /changeAddress:
 *   post:
 *     summary: Update user address
 *     description: Allows an authenticated user to update one of their saved addresses by providing address details.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address_id
 *               - address_label
 *               - addr_line1
 *               - addr_line2
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               address_id:
 *                 type: string
 *                 example: "ADDR123456"
 *               address_label:
 *                 type: string
 *                 example: "Home"
 *               addr_line1:
 *                 type: string
 *                 example: "123 MG Road"
 *               addr_line2:
 *                 type: string
 *                 example: "Near Metro Station"
 *               city:
 *                 type: string
 *                 example: "Bangalore"
 *               state:
 *                 type: string
 *                 example: "Karnataka"
 *               pincode:
 *                 type: string
 *                 example: "560001"
 *     responses:
 *       200:
 *         description: Address updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Address updated successfully.
 *       400:
 *         description: Missing or invalid address details.
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       500:
 *         description: Server error during address update.
 */

router.post('/', util.verifyStoreName, token.verifyAuthToken, (req, res) => {
    const customerId = req.customer_id;
    const addressDetails = req.body;
    const database = new Database(req.storename);
    if(!customerId || !addressDetails.address_id || !addressDetails.address_label ||
        !addressDetails.addr_line1 || !addressDetails.addr_line2 || !addressDetails.city ||
        !addressDetails.city || !addressDetails.pincode || !addressDetails.state){
        res.status(400).json({"message": "Please fill out all fields."});
    }
    database.query(Sql.update_user_address(customerId, addressDetails))
        .then(result => {
            if(result.affectedRows === 1 && result.changedRows === 1){
                res.status(200).json({"message": "Address updated successfully."});
            }
            else{
                res.status(400).json({"message": "Invalid/missing details"});
            }
        })
        .catch(err => {
            res.status(500).json({err: err.message});
        })
})

module.exports = router;