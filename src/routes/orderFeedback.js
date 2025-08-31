const Database = require("../internal/database");
const Sql = require("../resource/sql");
const token = require('../internal/token');
const express = require("express");
const util = require('../utils/utils.js');

const router = express.Router();

/**
 * @swagger
 * /orderFeedback:
 *   post:
 *     tags:
 *       - User
 *     summary: Save the feedback for the delivery and app experience
 *     description: Accepts a delivery rating and app experience in the request body and returns a status of the update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 purchase_id:
 *                  type: string
 *                  example: "4"
 *                  description: order rating or delivery rating
 *                 order_rating:
 *                   type: string
 *                   example: "4"
 *                   description: order rating or delivery rating
 *                 app_experience:
 *                   type: string
 *                   example: "5"
 *                   description: Rating of the app_experience by the user
 *     responses:
 *      200:
 *         description: Feedback successfully saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123"
 *                       status:
 *                         type: string
 *                         example: "true"
 *                       message:
 *                          type: string
 *                          example: "Feedback updated"
 *      500:
 *         description: Internal server error
 *
 */

router.post('/', util.verifyStoreName, token.verifyAuthToken, function (req, res, next) {
    console.log(`Accessing save feedback router by ${req.customer_id}`);
    const payload =req.body;
    const purchase_id=payload.purchase_id;
    const order_rating = payload.order_rating;
    const app_experience =payload.app_experience;
    if(purchase_id===undefined || order_rating===undefined || order_rating<0 || order_rating>5 || app_experience===undefined || app_experience<0 || app_experience>5){
        return res.status(400).json({status: false, message: "Invalid parameters"});
    }
    const database = new Database(req.storename);
    database.query(Sql.update_feedback_for_purchase_id(purchase_id, order_rating, app_experience))
        .then(result => {
            res.status(200).json({status: true, message: "App experience and delivery feedback updated successfully"});
        })
        .catch(err => res.status(500).json({error : err}));
});

module.exports = router;