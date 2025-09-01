const express = require('express');
const Database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const StoreOpen = require('../helpers/storeOpenHelper.js');
const util = require('../utils/utils.js');

const router = express.Router();

/**
 * @swagger
 * /isStoreOpen:
 *   get:
 *     summary: Check if the store is currently open
 *     description: Returns `true` if the current server time is between store opening and closing times, otherwise `false`.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Store open status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isOpen:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Server error while checking store hours
 *
 */

router.get('/', util.verifyStoreName, (req,res) => {
    const database = new Database(req.storename);
    database.query(Sql.get_store_timings())
        .then(result => {
            if (result.length === 1 && result[0].opening_time && result[0].closing_time){
                const open_time = result[0].opening_time;
                const close_time = result[0].closing_time;
                const isOpen = StoreOpen.isOpen(open_time, close_time);

                res.status(200).json({isOpen: isOpen});
            }
        })
        .catch(err =>{
            res.status(500).json({error: err.message});
        })
})
module.exports = router;