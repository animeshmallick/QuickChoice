const database = require('../internal/database.js');
const placeOrderHelper = require('../helpers/placeOrderHelper.js');
const Sql = require('../resource/sql.js');
const express = require('express');
const token = require('../internal/token');
const PurchaseStatus = require("../constants/PurchaseStatus");
const util = require("../utils/utils.js");

const router = express.Router();

/**
 * @swagger
 * /placeOrder:
 *   post:
 *     tags:
 *       - User
 *     summary: Place a new order
 *     description: Places a new order for the authenticated user. Validates the address, payment method, and product inventory before creating the order.
 *     security:
 *       - xAuthorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purchase_id
 *               - address
 *               - payment
 *               - cart
 *             properties:
 *               purchase_id:
 *                 type: string
 *                 example: PID-123456789-ABCDEF
 *               address:
 *                 type: string
 *                 example: ADDR12345
 *               payment:
 *                 type: string
 *                 example: cod
 *               cart:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - ProductID
 *                     - Quantity
 *                   properties:
 *                     ProductID:
 *                       type: string
 *                       example: 1
 *                     Quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer_id:
 *                   type: string
 *                 purchase_id:
 *                   type: string
 *                 placedAt:
 *                   type: string
 *                 payment_status:
 *                   type: string
 *                 status:
 *                   type: string
 *                 signed:
 *                   type: boolean
 *                 inventory_reduced:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       206:
 *         description: Order placed but inventory update failed
 *       400:
 *         description: Bad request - missing or invalid input
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/', token.verifyAuthToken,
    placeOrderHelper.verifyIsNewPurchase, placeOrderHelper.verifyAddressOwnership,
    placeOrderHelper.createOrders, placeOrderHelper.verifyPaymentMethod,
    function (req, res, next){
    try{
        const purchase_doc = {
            customer_id: req.customer_id,
            signed: false,
            timestamp: util.getDateTimeStringFormatted(),
            message: `UserID (${req.customer_id}) Trying to Place Order`,
            purchase_id: req.purchase_id,
            address: req.address,
            payment_method: req.payment_method,
            orders: req.order,
            payment_status: "PENDING",
        };

        database.query(Sql.insertIntoOrdersTable(), [placeOrderHelper.convertOrdersToArray(purchase_doc.orders)])
            .then(result => {
                console.log("Orders Inserted Successfully");
                purchase_doc.message = `Order Placed Successfully`;
                database.query(Sql.reduceInventory(), [placeOrderHelper.convertProductIdToArray(purchase_doc.orders)])
                    .then(result => {
                        purchase_doc.inventory_reduced = true;
                        purchase_doc.status = PurchaseStatus.PLACED;
                        console.log("Inventory Reduced Successfully");
                        database.query(Sql.insertIntoPurchaseTable(),
                            [[placeOrderHelper.getInsertablePurchaseDoc(purchase_doc)]])
                            .then(result => {
                                purchase_doc.signed = true;
                                purchase_doc.placedAt = util.getDateTimeStringFormatted();
                                console.log("Purchase Document Inserted Successfully");
                                res.status(201).json(purchase_doc);
                            })
                            .catch(err => {
                                res.status(500).json({error: err.message});
                            })
                    }).catch(err => {
                        res.status(206).json({status: "Order Placed Successfully, but Inventory Reduction Failed",
                            error: err.message, purchase_doc: purchase_doc});
                    });
            }).catch(err => {
                res.status(500).json({error: err.message});
        });
    }catch (err){
        console.log(err);
        res.status(400).json({error: err.message});
    }
});

module.exports = router;