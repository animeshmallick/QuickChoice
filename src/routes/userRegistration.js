const Database = require('../internal/database.js');
const Token = require('../internal/token.js');
const Sql = require('../resource/sql.js');
const express = require('express');
const userRegistrationHelper = require("../helpers/userRegistrationHelper.js");
const util = require('../utils/utils.js');

const router = express.Router();

/**
 * @swagger
 * /userRegistration:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fname
 *               - lname
 *               - phone
 *               - password
 *               - email
 *             properties:
 *               fname:
 *                 type: string
 *                 example: John
 *               lname:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               password:
 *                 type: string
 *                 example: mysecurepassword
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: User Registration Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User Registration Successful
 *                 authToken:
 *                   type: string
 *                   description: Authentication token for the registered user
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid User Registration Details
 *       500:
 *         description: Internal Server Error
 */

router.post('/', util.verifyStoreName, userRegistrationHelper.isNewUser,userRegistrationHelper.createUserId,function (req, res, next) {
    const userRegistrationDetails = req.body;
    if (!userRegistrationDetails.hasOwnProperty('fname') || !userRegistrationDetails.hasOwnProperty('lname') ||
        !userRegistrationDetails.hasOwnProperty('phone') || !userRegistrationDetails.hasOwnProperty('password') ||
        !userRegistrationDetails.hasOwnProperty('email'))
        return res.status(400).json({error: "Invalid/Missing User Registration Details"});

    console.log(`Generating New UserId`);
    const userid = req.userid;
    const authToken = Token.getToken(userid);
    const database = new Database(req.storename);
    database.query(Sql.register_user(userRegistrationDetails, userid))
        .then(data => {
            res.status(200).json({message: 'User Registration Successful', authToken: authToken});
        })
        .catch(err => {
            res.status(500).json({message: 'Something went wrong.'});
        });
});
module.exports = router;