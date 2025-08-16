const mysql = require("mysql2/promise");

class Database {
    #pool;

    constructor() {
        this.#pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    query(sql_query, params = []) {
        return this.#pool.query(sql_query, params)
            .then(([rows]) => rows)
            .catch((err) => {
                console.error("Error executing SQL query:", err);
                throw err;
            });
    }
}

module.exports = new Database();
