const Database = require('../internal/database.js')
const Sql = require('../resource/sql.js');
const express = require('express');
const token = require('../internal/token');
const util = require("../utils/utils");
const utils = require("../utils/utils");
const Token = require("../internal/token");

const router = express.Router();

/**
 * @swagger
 * /queueSize:
 *   get:
 *     tags:
 *       - User
 *     summary: Get the queue size for the customer id
 *     description: Returns a json object with queue size.
 *     responses:
 *       200:
 *         description: Successfully fetched the queue for the customer id.
 *       500:
 *          description: Internal Server Error
 */
router.get('/', util.verifyStoreName, token.verifyAuthToken, (req, res) => {
    const customerId = req.customer_id;
    console.log(`Get queue status count for ${customerId}`);
    const database = new Database(req.storename);
    database.query(Sql.get_all_purchase_status_for_today(customerId))
        .then(result => {
            const statusCountMap={};
            result.forEach(row=> {
                statusCountMap[row.status]=row.counts;
            });
            res.status(200).json(statusCountMap);
        })
        .catch(err => res.status(500).json({error : err.message}));
});

/**
 * @swagger
 * /queueSize/admin:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get the queue size for the admin
 *     description: Returns a json object with queue size.
 *     responses:
 *       200:
 *         description: Successfully fetched the queue for the admin.
 *       500:
 *          description: Internal Server Error
 */
router.get("/admin", utils.verifyStoreName, Token.verifyAdminAuthToken, function (req, res, next) {
    console.log(`Get queue status count for admin`);
    const database = new Database(req.storename);
    database.query(Sql.get_all_status_from_purchase())
        .then( result => {
            const statusCountMap={};
            result.forEach(row=> {
                statusCountMap[row.status]=row.counts;
            });
            res.status(200).json(statusCountMap);
        })
        .catch(err => res.status(500).json({error : err.message}));
});

module.exports=router;