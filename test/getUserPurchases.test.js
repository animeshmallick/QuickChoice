const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

jest.mock('../src/utils/utils', () => ({
    verifyStoreName: jest.fn((req, res, next) => next())
}));

jest.mock('../src/internal/token', () => ({
    verifyAuthToken: jest.fn()
}));

jest.mock('../src/resource/sql', () => ({
    get_user_purchases: jest.fn((id) => `SQL for ${id}`)
}));

const mockParseUserPurchases = jest.fn();
jest.mock('../src/helpers/getUserPurchasesHelper', () => {
    return jest.fn().mockImplementation(() => {
        return { parseUserPurchases: mockParseUserPurchases };
    });
});

const request = require('supertest');
const express = require('express');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const UserPurchasesHelper = require('../src/helpers/getUserPurchasesHelper');
const getUserPurchasesRouter = require('../src/routes/getUserPurchases');

const app = express();
app.use(express.json());
app.use('/', getUserPurchasesRouter);

describe('GET /getUserPurchases', () => {
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

    it('should return 200 with parsed purchases if successful', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER123';
            next();
        });

        const mockDbResult = [
            { purchase_id: 'PURCH1', product_id: 'PROD1', quantity: 2, purchase_date: '2025-07-20T14:48:00.000Z', status: 'DELIVERED' }
        ];

        const mockParsedResult = [
            { purchaseId: 'PURCH1', products: [{ id: 'PROD1', qty: 2 }], status: 'DELIVERED' }
        ];

        mockQuery.mockResolvedValueOnce(mockDbResult);
        mockParseUserPurchases.mockResolvedValueOnce(mockParsedResult);

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');
        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual(mockParsedResult);
        expect(mockQuery).toHaveBeenCalledWith(Sql.get_user_purchases('USER123'));
        expect(mockParseUserPurchases).toHaveBeenCalledWith(mockDbResult);
    });

    it('should return 500 if database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER456';
            next();
        });

        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error' });
    });

    it('should return 500 if parsing purchases throws an error', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER789';
            next();
        });

        const mockDbResult = [{ purchase_id: 'PURCH_ERR' }];
        mockQuery.mockResolvedValueOnce(mockDbResult);
        mockParseUserPurchases.mockRejectedValueOnce(new Error('Parsing error'));

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'Parsing error' });
    });
});
