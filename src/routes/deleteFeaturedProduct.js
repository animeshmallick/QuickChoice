const express = require('express');
const Database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');
const util = require("../utils/utils");
const Token = require("../internal/token");

const router = express.Router();

/**
 * @swagger
 * /deleteFeaturedProduct:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Delete featured product for productId
 *     description: Accepts a list of ProductID and delete the Ids with Featured product.
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
 *         description: Featured product successfully deleted
 *      400:
 *         description: Invalid Parameters
 *      500:
 *         description: Internal server error
 *
 */

router.post('/', util.verifyStoreName, Token.verifyAdminAuthToken, function (req, res, next) {
    const payload= req.body;
    const database = new Database(req.storename);
    const tasks = payload.map(result => {
        if(!result.hasOwnProperty('id')){
            res.status(400).json({status:false, message: "Invalid Parameters Id not found"});
        }
    });
    const ids = payload.map(row=>row.id).filter(id=>id!==null && id!== undefined && id!=='');
    database.query(Sql.delete_featured_product_for_product_ids(ids))
        .then(result =>{
            res.status(200).json({status:true, message: "Featured product deleted for productid"});
        })
        .catch(err => res.status(500).json({error : err.message}));
});
module.exports = router;