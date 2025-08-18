const express = require('express');
const Database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');
const util = require("../utils/utils");

const router = express.Router();

/**
 * @swagger
 * /deleteHappyHour:
 *   get:
 *     tags:
 *       - User
 *     summary: Delete happy hours for productId
 *     description: Deletes all the Happy hours products.
 *     responses:
 *      200:
 *         description: Happy hours successfully updated
 *      400:
 *         description: Invalid Parameters
 *      500:
 *         description: Internal server error
 *
 */

router.get('/', util.verifyStoreName, function (req, res, next) {
    const database = new Database(req.storename);
    try {
        database.query(Sql.delete_happy_hours());
        res.status(200).json({status: true, message: "Happy hours deleted successfully"});
    } catch (err) {
        res.status(500).json({error: err});
    }
});
module.exports = router;