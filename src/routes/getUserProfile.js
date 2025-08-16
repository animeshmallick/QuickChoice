const database = require('../internal/database.js')
const Sql = require('../resource/sql.js');
const express = require('express');
const token = require("../internal/token");

const router = express.Router();

/**
 * @swagger
 * /getUserProfile:
 *   get:
 *     tags:
 *         - User
 *     summary: Get user profile
 *     description: Fetches the user's name and phone number using the customer ID from a verified JWT token.
 *     security:
 *      - xAuthorization: []
 *     responses:
 *       200:
 *         description: Successfully fetched user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fname:
 *                   type: string
 *                   example: Animesh
 *                 lname:
 *                    type: string
 *                    example: Mallick
 *                 phone:
 *                   type: string
 *                   example: +91 9876543210
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', token.verifyAuthToken, (req, res) => {
    const customerId = req.customer_id;
    console.log(`Get User Profile for CustomerID : ${customerId}`);
    database.query(Sql.get_user_profile(customerId))
        .then(result => {
            console.log(`User profile fetched : ${result}`);
            res.status(200).json({fname: result[0].fname, lname: result[0].lname, phone: result[0].phone});
        })
        .catch(err => {
            return res.status(500).json({error: err.message});
        });
});

module.exports = router;