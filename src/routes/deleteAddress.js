const express = require('express');
const database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const token = require('../internal/token');

const router = express.Router();

/**
 * @swagger
 * /deleteAddress/{address_id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Delete the address if the addressId belong to the customerId
 *     description: Returns a object with status true if adrressId belong to customerId.
 *     parameters:
 *       - name: address_id
 *         in: path
 *         required: true
 *         description: AddressId
 *         schema:
 *           type: string
 *           example: ADDRN8DRXZ
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       400:
 *          description: Address does not belong to the customerID
 */

router.get('/:address_id', token.verifyAuthToken,
    function (req, res, next) {
        const address = req.params.address_id;
        const customerId = req.customer_id;
        database.query(Sql.check_if_address_belongs_to_customer(address, customerId))
            .then(result => {
                if(result.length===0){
                    console.log(`Address ID ${address} does not belong to customer ID ${customerId}`);
                    return res.status(400).json({status: false, message: "Address does not belong to the customerID"});
                }
                database.query(Sql.delete_address_for_customer(address, customerId))
                    .then(newresult => {
                        console.log(`Address ID ${address} successfully deleted for customer ID ${customerId}`);
                        res.status(200).json({status:true, message: "Address successfully deleted"})
                    })

            })
    });
module.exports = router;