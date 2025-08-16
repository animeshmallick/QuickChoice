jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

jest.mock('../src/internal/token', () => ({
    verifyAuthToken: jest.fn()
}));

jest.mock('../src/resource/sql', () => ({
    get_user_purchases: jest.fn((id) => `SQL for ${id}`)
}));

jest.mock('../src/helpers/getUserPurchasesHelper', () => ({
    parseUserPurchases: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const database = require('../src/internal/database');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const UserPurchasesHelper = require('../src/helpers/getUserPurchasesHelper');
const getUserPurchasesRouter = require('../src/routes/getUserPurchases');

const app = express();
app.use(express.json());
app.use('/', getUserPurchasesRouter);

describe('GET /getUserPurchases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if token verification fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ error: "Unauthorized" });
        });

        const res = await request(app).get('/');
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

        database.query.mockResolvedValueOnce(mockDbResult);
        UserPurchasesHelper.parseUserPurchases.mockResolvedValueOnce(mockParsedResult);

        const res = await request(app)
            .get('/')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual(mockParsedResult);
        expect(database.query).toHaveBeenCalledWith(Sql.get_user_purchases('USER123'));
        expect(UserPurchasesHelper.parseUserPurchases).toHaveBeenCalledWith(mockDbResult);
    });

    it('should return 500 if database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER456';
            next();
        });

        database.query.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(app)
            .get('/')
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
        database.query.mockResolvedValueOnce(mockDbResult);
        UserPurchasesHelper.parseUserPurchases.mockRejectedValueOnce(new Error('Parsing error'));

        const res = await request(app)
            .get('/')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'Parsing error' });
    });
});
