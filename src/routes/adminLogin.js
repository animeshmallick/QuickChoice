const database = require('../internal/database.js');
const Token = require('../internal/token.js');
const Sql = require('../resource/sql.js');
const express = require('express');

const router = express.Router();

/**
 * @swagger
 * /adminLogin:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin login endpoint
 *     description: Authenticates an admin user using phone and password. Returns a JWT token only if the user is an admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9123456789"
 *                 description: Admin phone number
 *               password:
 *                 type: string
 *                 example: "admin123"
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Admin authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 adminAuthToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Missing phone or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Login Details"
 *       401:
 *         description: Not an admin or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No Admin User Details Found for phone 9123456789 and password admin123"
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/', function (req, res, next) {
    const loginDetails = req.body;
    if (!loginDetails.hasOwnProperty('phone') || !loginDetails.hasOwnProperty('password'))
        return res.status(400).json({error: "Invalid Login Details"});
    let adminAuthToken = "";
    console.log(`Getting Admin Auth Token for Phone : ${loginDetails.phone}`);
    database.query(Sql.verify_login_details(BigInt(loginDetails.phone), loginDetails.password))
        .then(sql_response => {
            if (sql_response.length === 1 && sql_response[0].userid != null && sql_response[0].isAdmin){
                adminAuthToken = Token.getAdminToken(sql_response[0].userid);
                console.log(`Admin Auth Token Generated for Phone : ${loginDetails.phone}`);
                res.status(200).json({adminAuthToken: adminAuthToken})
            }else{
                res.status(401).json({error: `No Admin User Details Found for phone ${loginDetails.phone} and password ${loginDetails.password}`});
            }
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});
module.exports = router;