// routes/getPaymentMethod.js

const express = require('express');
const token = require('../internal/token'); // Middleware to verify token

const router = express.Router();

/**
 * @swagger
 * /getPaymentMethod:
 *   get:
 *     tags:
 *       - User
 *     summary: Get available payment methods
 *     description: Returns a list of supported payment methods for the user. Requires authentication.
 *     security:
 *       - xAuthorization: []
 *     responses:
 *       200:
 *         description: List of payment methods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "cod"
 *                   name:
 *                     type: string
 *                     example: "Pay on Delivery"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', token.verifyAuthToken, (req, res) => {
    // Return fixed payment method
    const paymentMethod = [{id: "cod", name: "Pay on Delivery"}];
    res.status(200).json(paymentMethod);
});
module.exports = router;
