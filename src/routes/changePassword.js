const express = require('express');
const Database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');
const util = require('../utils/utils.js');

const router = express.Router();

/**
 * @swagger
 * /changePassword:
 *   post:
 *     summary: Update user password
 *     description: Allows an authenticated user to change their password by providing the old and new password.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: admin@1
 *               newPassword:
 *                 type: string
 *                 example: admin@2
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully.
 *       400:
 *         description: Invalid old password or new password is same as old.
 *       401:
 *         description: Unauthorized (invalid or missing token).
 *       500:
 *         description: Server error during password update.
 */

router.post('/', util.verifyStoreName, token.verifyAuthToken, (req, res) => {
    const customerId = req.customer_id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const database = new Database(req.storename);
    database.query(Sql.get_user_password(customerId))
    .then(result => {
        if (result && result.length === 1) {
            if(result[0].password === oldPassword && oldPassword !== newPassword){
                database.query(Sql.update_user_password(customerId, newPassword))
                .then(result => {
                    if(result.affectedRows === 1){
                        res.status(200).json({"message": "Password updated successfully."});
                    }
                }).catch(err => {
                    res.status(500).json({err: err.message});
                })
            }else{
                res.status(400).json({"error": "Invalid Details Entered"});
            }
        }
    }).catch(err => {
        res.status(500).json({err: err.message});
    })
})

module.exports = router;