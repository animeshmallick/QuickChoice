const database = require("../internal/database");
const Sql = require("../resource/sql");
const AddressOwnershipException = require("../exception/AddressOwnershipException");

class SetDefaultAddressHelper {
    async verifyAddressOwnership(req, res, next) {
        if (!req.body.hasOwnProperty('address_id'))
            throw new AddressOwnershipException();
        if(req.body.address_id === "pickup_at_store") {
            req.address_id = {address_id: req.body.address_id};
            next();
            return;
        }
        try {
            const rows = await database.query(Sql.verify_address_belong_to_user(req.customer_id, req.body.address_id));
            if (rows.length === 0) {
                throw new AddressOwnershipException("Address Ownership failed",400);
            }
            req.address = rows[0];
            console.log("Address Ownership Verified");
            next();
        } catch (err) {
            next(err);
        }
    }
}
module.exports = new SetDefaultAddressHelper();