// routes/getPurchaseID.js

const express = require('express');
const token = require('../internal/token'); // Middleware to verify token
const helper = require('../helpers/getPurchaseIdHelper');
const router = express.Router();
const util = require('../utils/utils.js');

/**
 * @swagger
 * /getPurchaseID:
 *   get:
 *     tags:
 *       - User
 *     summary: Generate a new Purchase ID
 *     description: Returns a unique purchase ID for the authenticated user.
 *     responses:
 *       200:
 *         description: Successfully generated a purchase ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 purchaseID:
 *                   type: string
 *                   example: PID123456789
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */

router.get('/', util.verifyStoreName, token.verifyAuthToken, (req, res) => {
    // Return fixed payment method
    const purchaseID = helper.getPurchaseID();
    res.status(200).json({purchaseID: purchaseID});
});
module.exports = router;
