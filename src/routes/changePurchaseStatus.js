const express = require('express');
const Database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');
const helper = require('../helpers/changePurchaseStatusHelper.js');
const util = require('../utils/utils.js');

const router = express.Router();

/**
 * @swagger
 * /changePurchaseStatus/{pid}/{status}:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Change the status of a purchase
 *     description: Allows an authenticated admin to update the status of a purchase order if the transition is allowed.
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique purchase ID
 *         example: "PURCH123"
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PLACED, CONFIRMED, PACKAGING, READY_TO_SHIP, OUT_FOR_DELIVERY, DELIVERED_WITH_PAYMENT_SUCCESS, DELIVERED_WITH_PAYMENT_PENDING, CANCELLED]
 *         description: Update Status of the given PurchaseID
 *     responses:
 *       200:
 *         description: Status change successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: "Status Change Success from [PLACED] to [CONFIRMED]"
 *       400:
 *         description: Status change not allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Status Change Not Allowed from [PLACED] to [DELIVERED_WITH_PAYMENT_SUCCESS]"
 *       404:
 *         description: Invalid Purchase ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Purchase Id"
 *       401:
 *         description: Unauthorized (invalid admin token)
 *       403:
 *         description: Forbidden (admin token missing)
 *       500:
 *         description: Server or database error
 */
router.post('/:pid/:status', util.verifyStoreName, token.verifyAdminAuthToken, (req, res) => {
    console.log("Change Purchase Status Requested");
    const adminUserId = req.admin_user_id;
    const pid = req.params.pid;
    const status = req.params.status;
    console.log(`PID [${pid}] -> Status Change Requested by [${adminUserId}] to [${status}]`);
    const database = new Database(req.storename);
    database.query(Sql.get_purchase_status(pid))
        .then(result => {
            if (result.length === 1){
                const oldStatus = result[0].status;
                if(helper.isStatusChangeAllowed(oldStatus, status)){
                    database.query(Sql.change_purchase_status(pid, status))
                        .then(result => {
                            console.log(`PID [${pid}] -> Status Change Success [${oldStatus}] to [${status}]`);
                            res.status(200).json({success: `Status Change Success from [${oldStatus}] to [${status}]`});
                        })
                }else{
                    console.log(`PID [${pid}] -> Status Change Not Allowed from [${oldStatus}] to [${status}]`);
                    res.status(400).json({error: `Status Change Not Allowed from [${oldStatus}] to [${status}]`});
                }
            }else{
                res.status(404).json({error: "Invalid Purchase Id"});
            }
        })
});
module.exports = router;