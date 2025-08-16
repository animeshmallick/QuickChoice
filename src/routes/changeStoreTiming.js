const database = require('../internal/database.js');
const Token = require('../internal/token.js');
const Sql = require('../resource/sql.js');
const StoreTimingHelper = require('../helpers/StoreTimingHelper.js');
const express = require('express');

const router = express.Router();

/**
 * @swagger
 * /changeStoreTiming:
 *   post:
 *     summary: Change store open and close timings
 *     description: Allows an authenticated admin to change the store's opening and closing times.
 *     tags:
 *       - Admin
 *     security:
 *       - xAuthorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - open_time
 *               - close_time
 *             properties:
 *               open_time:
 *                 type: string
 *                 example: "09:00:00"
 *                 description: Store opening time in HH:mm format
 *               close_time:
 *                 type: string
 *                 example: "21:00:00"
 *                 description: Store closing time in HH:mm format
 *     responses:
 *       200:
 *         description: Store timings changed successfully
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
 *                   example: Store timings changed successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */

router.post('/',Token.verifyAdminAuthToken,StoreTimingHelper.validateReqParams,(req, res, next) => {
    const isAdmin = req.admin_user_id;
    if (isAdmin && req.body.hasOwnProperty('open_time') && req.body.hasOwnProperty('close_time')) {
        database.query(Sql.change_store_timings(req.body.open_time,req.body.close_time))
            .then((result) => {
                res.status(200).json({success: true, message: "Store timings changed successfully"});
            })
            .catch((err) => {
                res.status(500).json({success: false, message: err.message});
            })
        }else{
        res.status(400).json({success: false, message: "Invalid parameters"});
    }
});
module.exports = router;