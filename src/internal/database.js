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
                connectionLimit: 50,   // adjust based on load
                queueLimit: 0
            });

            Database.#pools.set(dbName, pool);
            this.#pool = pool;
        }
    }

    /**
     * Run a query safely using prepared statements
     * Ensures connections are always released back to pool
     */
    async query(sql, params = []) {
        let connection;
        try {
            connection = await this.#pool.getConnection();   // get a pooled connection
            const [rows] = await connection.execute(sql, params);
            return rows;
        } catch (err) {
            console.error("SQL Error:", err);
            throw err;
        } finally {
            if (connection) connection.release();  // ✅ always release, even on error
        }
    }

    /**
     * Gracefully close all pools (useful for app shutdown)
     */
    static async closeAll() {
        for (const pool of Database.#pools.values()) {
            await pool.end();
        }
        Database.#pools.clear();
    }
}

module.exports = Database;
