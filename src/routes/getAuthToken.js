const express = require('express');
const router = express.Router();
const token = require('../internal/token');

router.get('/', (req, res, next) =>{
    res.status(200).json({auth_token: token.getToken("GUEST")});
});
module.exports = router;