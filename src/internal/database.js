// database.js
const mysql = require("mysql2/promise");

class Database {
    static #pools = new Map(); // storename -> pool
    #pool;

    constructor(storename) {
        const dbName = storename || "dummyStore";

        if (Database.#pools.has(dbName)) {
            this.#pool = Database.#pools.get(dbName);
        } else {
            const pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: dbName,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            Database.#pools.set(dbName, pool);
            this.#pool = pool;
        }
    }

    async query(sql, params = []) {
        try {
            const [rows] = await this.#pool.execute(sql, params);
            return rows;
        } catch (err) {
            console.error("SQL Error:", err);
            throw err;
        }
    }

    static async closeAll() {
        for (const pool of Database.#pools.values()) {
            await pool.end();
        }
        Database.#pools.clear();
    }
}

module.exports = Database;
