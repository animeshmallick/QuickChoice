const database = require("../internal/database");
const Sql = require("../resource/sql");
const token = require('../internal/token');
const express = require("express");
const {removeDuplicatePayloads} = require('../helpers/saveFeedbackHelper.js');

const router = express.Router();

/**
 * @swagger
 * /saveFeedback:
 *   post:
 *     tags:
 *       - User
 *     summary: Save the feedback for the unique ProductId
 *     description: Accepts a list of ProductID and rating objects in the request body and returns a status of the update.
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
 *                 rating:
 *                   type: string
 *                   example: "2"
 *                   description: Rating of the product by the user
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
 *
 */


router.post('/', token.verifyAuthToken, function (req, res, next) {
    console.log(`Accessing save feedback router by ${req.customer_id}`);
    const payloads =req.body;
    const distinctpayloads = removeDuplicatePayloads(payloads);
    if(payloads.length!==distinctpayloads.length)

        return res.status(400).json({status:false, message:"Invalid parameters found in request body"});
    let updatedCount=0;
    const tasks = distinctpayloads.map(payload =>{
        if (!payload.hasOwnProperty('id') || !payload.hasOwnProperty(('rating')))
            Promise.resolve({id: payload.id || null, status: false, message: "Invalid Parameters"});

        const new_rating = payload.rating;
        const productId = payload.id;

        return database.query(Sql.get_product_from_productId(productId))
            .then(result => {
                if (result.length === 1) {
                    return database.query(Sql.update_feedback_rating(productId, new_rating))
                        .then(result => {
                            updatedCount++;
                            console.log(`Feedback updated for Product ID: ${productId} with rating ${new_rating} *`);
                            return {id: productId, status: true, message: "Feedback updated"};
                        })
                } else
                    return {id: productId, status: false, message: "Invalid ProductId"};
            })
    });
    Promise.all(tasks).then(results => res.status(200).json({ status:updatedCount>0,
        message:`${updatedCount} out of ${distinctpayloads.length} product feedback updated`}));
});

module.exports = router;