const utils = require('../utils/utils.js');

class StoreTimingHelper {
    validateReqParams(req, res, next)
    {
        if (req.body.hasOwnProperty('open_time') && req.body.hasOwnProperty('close_time') &&
            utils.isValidTime(req.body.open_time) && utils.isValidTime(req.body.close_time)) {
                next();
        } else{
            res.status(400).json({success: false, message: 'Invalid parameters sent'});
        }
    }
}
module.exports = new StoreTimingHelper();
