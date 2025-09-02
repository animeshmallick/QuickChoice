// __tests__/mostOrderedProduct.test.js
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
    get_most_ordered_product: jest.fn((customerId) => `SQL_most_ordered for ${customerId}`),
    get_productId_by_count_from_orderId: jest.fn((placeholders) => `SQL_get_productId with ${placeholders}`)
}));

const request = require('supertest');
const express = require('express');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const mostOrderedProductRouter = require('../src/routes/mostOrderedProduct');

const app = express();
app.use(express.json());
app.use('/', mostOrderedProductRouter);

describe('GET /mostOrderedProduct', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 401 if token verification fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ error: "Unauthorized" });
        });

        const res = await request(app).get('/').set('x-storename', 'dummyStore');
        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: "Unauthorized" });
    });

    it('should return 200 with most ordered products if successful', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER123';
            next();
        });

        // Step 1: mock first query result (order_ids)
        const mockOrderResult = [
            { order_id: 'ORD1&&ORD2' },
            { order_id: 'ORD3' }
        ];

        // Step 2: mock second query result (products)
        const mockProductResult = [
            { product_id: '18' },
            { product_id: '9' }
        ];

        mockQuery
            .mockResolvedValueOnce(mockOrderResult) // for get_most_ordered_product
            .mockResolvedValueOnce(mockProductResult); // for get_productId_by_count_from_orderId

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual(mockProductResult);

        expect(mockQuery).toHaveBeenNthCalledWith(1, Sql.get_most_ordered_product('USER123'));
        expect(mockQuery).toHaveBeenNthCalledWith(
            2,
            Sql.get_productId_by_count_from_orderId('?,?,?'),
            ['ORD1', 'ORD2', 'ORD3']
        );
    });

    it('should return 500 if first database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER500';
            next();
        });

        mockQuery.mockRejectedValueOnce(new Error('DB error in first query'));

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error in first query' });
    });

    it('should return 500 if second database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER999';
            next();
        });

        mockQuery
            .mockResolvedValueOnce([{ order_id: 'O1&&O2' }]) // first query ok
            .mockRejectedValueOnce(new Error('DB error in second query')); // second query fails

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error in second query' });
    });
});
