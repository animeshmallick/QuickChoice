const express = require('express');
const router = express.Router();
const token = require('../internal/token');
const util = require('../utils/utils.js');

router.post('/', util.verifyStoreName, token.verifyAuthToken, (req, res, next) => {
    console.log(`User login check ${req.customer_id}`);
    res.status(200).json({is_valid_user: true});
});
router.post('/admin', util.verifyStoreName, token.verifyAdminAuthToken, (req, res, next) => {
    console.log(`Admin User login check ${req.admin_user_id}`);
    res.status(200).json({is_valid_admin: true});
});
module.exports = router;