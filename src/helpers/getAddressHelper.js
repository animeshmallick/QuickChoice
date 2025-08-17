// helpers/getAddressHelper.js
const Sql = require('../resource/sql.js');

class AddressHelper {
    #database;
    constructor(database) {
        this.#database = database;
    }
    async get_default_address(){
        let defaultAddress = {};
        const rows = await this.#database.query(Sql.get_store_address());
            if(rows.length === 1){
                defaultAddress = {
                    store_name: rows[0].store_name,
                    address_id: rows[0].address_id,
                    addr_line1: rows[0].addr_line1,
                    addr_line2: rows[0].addr_line2,
                    city: rows[0].city,
                    state: rows[0].state,
                    pincode: rows[0].pincode
                }
            }
        return defaultAddress;
    }
    parseUserAddress(result) {
        // Filter out any rows that have no meaningful address data
        const filteredAddresses = result
            .filter(row => (row.addr_line1?.trim() || row.addr_line2?.trim()))
            .map(row => ({
                address_label: row.address_label,
                address_id: row.address_id,
                addr_line1: row.addr_line1,
                addr_line2: row.addr_line2,
                city: row.city,
                state: row.state,
                pincode: row.pincode,
                isDefault: row.isDefault === 1
            }));
        return filteredAddresses;
    }
}

module.exports = AddressHelper;
