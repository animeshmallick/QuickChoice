const Database = require('../internal/database');
const Sql = require('../resource/sql');
const express = require('express');
const utils = require('../utils/utils');
const Token = require('../internal/token');
const getAllPurchaseHelper = require("../helpers/getAllPurchase");

const router = express.Router();

/**
 * @swagger
 * /getAllPurchase/{date}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all purchases for the given date
 *     description: Returns a list of all purchases for the given date. Requires admin authorization.
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         description: Date in YYYY-MM-DD format
 *         schema:
 *           type: string
 *           example: "2025-07-21"
 *     responses:
 *       200:
 *         description: A list of purchases for the given date
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   purchaseId:
 *                     type: string
 *                   status:
 *                     type: string
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                   total:
 *                     type: number
 *       401:
 *         description: Unauthorized - Admin token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get("/:date", utils.verifyStoreName, Token.verifyAdminAuthToken, function (req, res, next) {
    console.log("Getting All Purchase for the date : "+req.params.date);
    const date = req.params.date;
    const database = new Database(req.storename);
    database.query(Sql.get_all_purchase(date))
        .then(async sql_response => {
            const response = await getAllPurchaseHelper.createPurchaseWrapper(database, req.storename, sql_response);
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});

/**
 * @swagger
 * /getAllPurchase:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get today's purchases
 *     description: Returns a list of all purchases for today. Requires admin authorization.
 *     responses:
 *       200:
 *         description: A list of today's purchases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   purchaseId:
 *                     type: string
 *                   status:
 *                     type: string
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                   total:
 *                     type: number
 *       401:
 *         description: Unauthorized - Admin token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get("/", utils.verifyStoreName, Token.verifyAdminAuthToken, function (req, res, next) {
    console.log("Getting All Purchase for the Today's date");
    const date = utils.getDateString();
    const database = new Database(req.storename);
    database.query(Sql.get_all_purchase(date))
        .then(async sql_response => {
            const response = await getAllPurchaseHelper.createPurchaseWrapper(database, req.storename, sql_response);
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({error: err.message});
        });
});
module.exports = router;
