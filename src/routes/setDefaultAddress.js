const database = require('../internal/database.js');
const token = require('../internal/token.js');
const Sql = require('../resource/sql.js');
const helper = require('../helpers/setDefaultAddressHelper.js');
const express = require('express');

const router = express.Router();

/**
 * @swagger
 * /setDefaultAddress:
 *   post:
 *     summary: Set a default address for the authenticated user
 *     description: Updates the user's addresses so that only the specified address is marked as default (`isDefault = 1`) and all others are set to `isDefault = 0`.
 *     tags:
 *       - User
 *     security:
 *       - xAuthorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address_id
 *             properties:
 *               address_id:
 *                 type: string
 *                 example: "ADDRS1111111"
 *     responses:
 *       200:
 *         description: Default address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Default address changed successfully
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Server error while updating the default address
 */

router.post('/',token.verifyAuthToken, helper.verifyAddressOwnership,(req,res,next) => {
    const customer_id = req.customer_id;
        database.query(Sql.set_default_address(customer_id,req.body.address_id))
        .then(result => {
                res.status(200).json({success: true, message: "Default address changed successfully"});
        })
            .catch(err => {
                res.status(400).json({success: false, error: "Invalid parameters"});
            });
});
module.exports = router;