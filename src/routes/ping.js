const express = require('express');
const router = express.Router();
const token = require('../internal/token');
const util = require('../utils/utils.js');


/**
 * @swagger
 * /ping:
 *   get:
 *     tags:
 *         - User
 *     summary: Pings the backend serer
 *     description: Returns a message confirming the server is running
 *     responses:
 *       200:
 *         description: To check if the backend server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ping From Backend Server
 */
router.get('/', (req, res) =>{
    res.status(200).json({"message": "Ping From Backend Server"});
});

/**
 * @swagger
 * /ping:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Ping backend server
 *     description: Returns a success message to confirm the backend is reachable. Requires admin authentication.
 *     responses:
 *       200:
 *         description: To check if the backend server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ping From Backend Server
 */

router.post('/', util.verifyStoreName, token.verifyAdminAuthToken, (req, res, next) => {
    res.status(200).json({"message": "Ping From Backend Server", "user": req.admin_user_id});
});
module.exports = router;