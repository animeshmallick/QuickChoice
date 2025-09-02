// __tests__/setHappyHoursProduct.test.js
const mockQuery = jest.fn();

// Mock Database
jest.mock('../src/internal/database', () => {
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

// Mock utils middleware
jest.mock('../src/utils/utils', () => ({
    verifyStoreName: jest.fn((req, res, next) => next())
}));

// Mock token middleware
jest.mock('../src/internal/token', () => ({
    verifyAdminAuthToken: jest.fn()
}));

// Mock SQL
jest.mock('../src/resource/sql', () => ({
    set_happy_hours_for_product_ids: jest.fn((ids) => `SQL_set_happy_hours with [${ids}]`)
}));

const request = require('supertest');
const express = require('express');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const setHappyHoursRouter = require('../src/routes/setHappyHourProducts');

const app = express();
app.use(express.json());
app.use('/', setHappyHoursRouter);

describe('POST /setHappyHoursProduct', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 401 if admin token verification fails', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ error: "Unauthorized" });
        });

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send([{ id: "1" }]);

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: "Unauthorized" });
    });

    it('should return 400 if any payload object is missing id', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res, next) => next());

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send([{ name: "InvalidProduct" }]); // no `id`

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ status: false, message: "Invalid Parameters Id not found" });
    });

    it('should return 200 when happy hours are successfully updated', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res, next) => next());

        mockQuery.mockResolvedValueOnce({ affectedRows: 2 });

        const payload = [{ id: "101" }, { id: "202" }];
        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send(payload);

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            status: true,
            message: "Happyhours updated for productid"
        });

        expect(mockQuery).toHaveBeenCalledWith(
            Sql.set_happy_hours_for_product_ids(["101", "202"])
        );
    });

    it('should return 500 if database query fails', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res, next) => next());

        mockQuery.mockRejectedValueOnce(new Error("DB error in set_happy_hours"));

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send([{ id: "303" }]);

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: "DB error in set_happy_hours" });
    });
});
