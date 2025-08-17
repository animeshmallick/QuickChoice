const express = require('express');
const router = express.Router();
const token = require('../internal/token');
const util = require('../utils/utils.js');

router.get('/', util.verifyStoreName, (req, res, next) =>{
    res.status(200).json({auth_token: token.getToken("GUEST")});
});
module.exports = router;