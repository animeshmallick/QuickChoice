// __tests__/deleteAddress.test.js
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
    verifyAuthToken: jest.fn()
}));

// Mock SQL queries
jest.mock('../src/resource/sql', () => ({
    check_if_address_belongs_to_customer: jest.fn((address, customerId) =>
        `SQL_check_address ${address} ${customerId}`
    ),
    delete_address_for_customer: jest.fn((address, customerId) =>
        `SQL_delete_address ${address} ${customerId}`
    )
}));

const request = require('supertest');
const express = require('express');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const deleteAddressRouter = require('../src/routes/deleteAddress');

const app = express();
app.use(express.json());
app.use('/', deleteAddressRouter);

describe('GET /:address_id (deleteAddress)', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 401 if token verification fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ error: "Unauthorized" });
        });

        const res = await request(app)
            .get('/ADDR123')
            .set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: "Unauthorized" });
    });

    it('should return 400 if address does not belong to the customer', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER123';
            next();
        });

        mockQuery.mockResolvedValueOnce([]); // No rows returned → invalid address

        const res = await request(app)
            .get('/ADDR_NOT_FOUND')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
            status: false,
            message: "Address does not belong to the customerID"
        });

        expect(mockQuery).toHaveBeenCalledWith(
            Sql.check_if_address_belongs_to_customer('ADDR_NOT_FOUND', 'USER123')
        );
    });

    it('should return 200 if address is deleted successfully', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER123';
            next();
        });

        mockQuery
            .mockResolvedValueOnce([{ address_id: 'ADDR123' }]) // belongs to customer
            .mockResolvedValueOnce(true); // delete success

        const res = await request(app)
            .get('/ADDR123')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            status: true,
            message: "Address successfully deleted"
        });

        expect(mockQuery).toHaveBeenNthCalledWith(
            1,
            Sql.check_if_address_belongs_to_customer('ADDR123', 'USER123')
        );
        expect(mockQuery).toHaveBeenNthCalledWith(
            2,
            Sql.delete_address_for_customer('ADDR123', 'USER123')
        );
    });

    it('should return 500 if first database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER_ERR1';
            next();
        });

        mockQuery.mockRejectedValueOnce(new Error('DB error in first query'));

        const res = await request(app)
            .get('/ADDR_ERR1')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error in first query' });
    });

    it('should return 500 if second database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER_ERR2';
            next();
        });

        mockQuery
            .mockResolvedValueOnce([{ address_id: 'ADDR_ERR2' }]) // check ok
            .mockRejectedValueOnce(new Error('DB error in delete query')); // delete fails

        const res = await request(app)
            .get('/ADDR_ERR2')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error in delete query' });
    });
});
