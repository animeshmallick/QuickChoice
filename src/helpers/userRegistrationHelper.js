const database = require('../internal/database.js');
const Sql = require('../resource/sql.js');
const DuplicateRegistrationException = require('../exception/DuplicateRegistrationException');
const MissingPhoneNumberException = require('../exception/MissingPhoneNumberException');
const CreateUserIdFailedException = require('../exception/CreateUserIdFailedException');
class UserRegistrationHelper{
    async isNewUser(req, res, next){
        if(!req.body.hasOwnProperty('phone')) {
            throw new MissingPhoneNumberException("Invalid/Missing phone number", 400);
        }
        const userDetails = await database.query(Sql.verify_phone_number(req.body.phone));
        if (userDetails.length === 0) {
            console.log("New User Registration: VERIFIED");
            next();
        }else{
            throw new DuplicateRegistrationException("Phone number already exists",400)
        }

    }
    async createUserId(req, res, next){
        let userid = '';
        const response = await database.query(Sql.get_last_userid());
        if(response.length === 1 && response[0].max_id !== null){
            userid =  "USR" + String(response[0].max_id + 1).padStart(3, '0');
            req.userid = userid;
            next();
        }else{
           throw new CreateUserIdFailedException("Registration Failed",400);
        }
    }
}
module.exports = new UserRegistrationHelper();