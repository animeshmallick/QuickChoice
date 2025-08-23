const Sql = require('../resource/sql');
class Utils {
    getDateTimeString(){
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        return `${dd}${mm}${yy}${hh}${min}${ss}`;
    }
    getDateTimeStringFormatted(){
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        return `${dd}/${mm}/${yy} ${hh}:${min}:${ss}`;
    }
    getDateString(){
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        return `${dd}${mm}${yy}`;
    }
    getRamdomString(length = 8){
        return Math.random().toString(36).substring(2, length + 2).toUpperCase();
    }
    isValidPhone(phone){
        const regex = /^\+[1-9]\d{1,14}$/; // E.164 format
        return regex.test(phone);
    }
    isValidTime(time) {
        // Matches 00:00:00 to 23:59:59
        const regex = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
        return regex.test(time);
    }
    verifyStoreName(req, res, next){
        const storeName = req.headers['x-storename'];
        if(!storeName){
            return res.status(403).json({message: "Store name is missing"});
        }
        req.storename = storeName;
        next();
    }
}
module.exports = new Utils();