// __tests__/changeAddress.test.js
const request = require('supertest');
const express = require('express');
const database = require('../src/internal/database');
const token = require('../src/internal/token');
const changeAddressRouter = require('../src/routes/changeAddress');

// Mock database and token
jest.mock('../src/internal/database', () => ({
    query: jest.fn()
}));

jest.mock('../src/internal/token', () => ({
    verifyAuthToken: (req, res, next) => {
        req.customer_id = "CUST123"; // fake authenticated user
        next();
    }
}));

const app = express();
app.use(express.json());
app.use('/', changeAddressRouter);

describe("Change Address Route", () => {
    const validPayload = {
        address_id: "ADDR123",
        address_label: "Home",
        addr_line1: "123 MG Road",
        addr_line2: "Near Metro",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001"
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if required fields are missing", async () => {
        const res = await request(app)
            .post('/')
            .send({}); // missing fields

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ message: "Please fill out all fields." });
    });

    it("should return 200 if address updated successfully", async () => {
        database.query.mockResolvedValueOnce({ affectedRows: 1, changedRows: 1 });

        const res = await request(app)
            .post('/')
            .send(validPayload);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Address updated successfully." });
        expect(database.query).toHaveBeenCalled();
    });

    it("should return 400 if update query runs but no row updated", async () => {
        database.query.mockResolvedValueOnce({ affectedRows: 0, changedRows: 0 });

        const res = await request(app)
            .post('/')
            .send(validPayload);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ message: "Invalid/missing details" });
        expect(database.query).toHaveBeenCalled();
    });

    it("should return 500 if database query fails", async () => {
        database.query.mockRejectedValueOnce(new Error("DB failure"));

        const res = await request(app)
            .post('/')
            .send(validPayload);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ err: "DB failure" });
        expect(database.query).toHaveBeenCalled();
    });
});