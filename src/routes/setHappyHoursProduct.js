const express = require('express');
const Database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');
const util = require("../utils/utils");

const router = express.Router();

/**
 * @swagger
 * /setHappyHoursProduct:
 *   post:
 *     tags:
 *       - User
 *     summary: Set happy hours for productId
 *     description: Accepts a list of ProductID and set the Ids with Happy hours.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                   description: ID of the product
 *     responses:
 *      200:
 *         description: Happy hours successfully updated
 *      400:
 *         description: Invalid Parameters
 *      500:
 *         description: Internal server error
 *
 */

router.post('/', util.verifyStoreName, function (req, res, next) {
    const payload=req.body;
    const database = new Database(req.storename);
    const tasks=payload.map(result => {
        if(!result.hasOwnProperty('id')){
            res.status(400).json({status:false, message: "Invalid Parameters Id not found"});
        }
    });
    const ids=payload.map(row=>row.id).filter(id=>id!==null && id!== undefined && id!=='');
    database.query(Sql.set_happy_hours_for_product_ids(ids))
        .then(result =>{
            res.status(200).json({status:true, message: "Happyhours updated for productid"});
        })
        .catch(err => res.status(500).json({error : err}));
});
module.exports = router;