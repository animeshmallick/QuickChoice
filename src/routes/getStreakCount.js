const Database = require('../internal/database.js')
const Sql = require('../resource/sql.js');
const express = require('express');
const token = require('../internal/token');
const {calculateStreak} = require('../helpers/streakCountHelper.js');
const util = require("../utils/utils");

const router = express.Router();

/**
 * @swagger
 * /getStreakCount:
 *   get:
 *     tags:
 *       - User
 *     summary: Get the streak count for the customer id
 *     description: Returns a json object with streak count.
 *     responses:
 *       200:
 *         description: Successfully fetched the streak count for the customer id.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                   - streakCount: "2"
 *       500:
 *          description: Internal Server Error
 */

router.get('/', util.verifyStoreName, token.verifyAuthToken,  (req, res) => {
    const customerId = req.customer_id;
    const database = new Database(req.storename);
    database.query(Sql.get_all_purchase_dates_for_customer(customerId))
        .then(result => {
            if(result.length===0) return res.status(200).json({streakCount:0});
            const dates=result.map(row => row.purchase_date);
            let streakCount=calculateStreak(dates);
            console.log(`Current streak for the customer ${customerId} is ${streakCount}`);
            res.status(200).json({streakCount:streakCount});
        })
        .catch(err => res.status(500).json({error : err}));
});

module.exports = router;