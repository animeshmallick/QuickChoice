const database = require('../internal/database.js');
const Token = require('../internal/token.js');
const Sql = require('../resource/sql.js');
const express = require('express');

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - User
 *     summary: Authenticate a user and return a JWT token
 *     description: Validates the user's phone and password. On success, returns a JWT token to be used in subsequent requests.
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
 *               password:
 *                 type: string
 *                 example: "password"
 *     responses:
 *       200:
 *         description: Authentication successful — JWT token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authToken:
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
 *         description: Invalid phone or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No User Details Found for phone 9123456789 and password P@ssw0rd"
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
router.post('/', function (req, res, next) {
    const loginDetails = req.body;
    if (!loginDetails.hasOwnProperty('phone') || !loginDetails.hasOwnProperty('password'))
        return res.status(400).json({error: "Invalid Login Details"});
    let authToken = "";
    console.log(`Getting Auth Token for Phone : ${loginDetails.phone}`);
    database.query(Sql.verify_login_details(BigInt(loginDetails.phone), loginDetails.password))
        .then(sql_response => {
            if (sql_response.length === 1 && sql_response[0].userid != null){
                authToken = Token.getToken(sql_response[0].userid);
                console.log(`Auth Token Generated for Phone : ${loginDetails.phone}`);
                res.status(200).json({authToken: authToken})
            }else{
                res.status(401).json({error: `No User Details Found for phone ${loginDetails.phone} and password ${loginDetails.password}`});
            }
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});
module.exports = router;