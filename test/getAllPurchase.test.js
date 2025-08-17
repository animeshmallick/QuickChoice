const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});
jest.mock('../src/internal/token', () => ({
    verifyAdminAuthToken: jest.fn()
}));

jest.mock('../src/helpers/getAllPurchase', () => ({
    createPurchaseWrapper: jest.fn()
}));

jest.mock('../src/utils/utils', () => ({
    getDateString: jest.fn(),
    verifyStoreName: jest.fn((req, res, next) => next())
}));

jest.mock('../src/resource/sql', () => ({
    get_all_purchase: jest.fn((date) => `SQL for ${date}`)
}));

const request = require('supertest');
const express = require('express');
const Token = require('../src/internal/token');
const getAllPurchaseHelper = require('../src/helpers/getAllPurchase');
const utils = require('../src/utils/utils');
const Sql = require('../src/resource/sql');
const getAllPurchaseRouter = require('../src/routes/getAllPurchase');

const app = express();
app.use(express.json());
app.use('/', getAllPurchaseRouter);

describe('GET /getAllPurchase', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 403 if no admin auth token provided', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res) => {
            res.status(403).json({ message: "Authorization Token Missing" });
        });

        const res = await request(app).get('/').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual({ message: "Authorization Token Missing" });
    });

    it('should return 401 if invalid admin token', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ message: "Invalid Authorization Token" });
        });

        const res = await request(app)
            .get('/')
            .set('x-storename','dummyStore')
            .set('x-authorization', 'Bearer badtoken');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ message: "Invalid Authorization Token" });
    });

    it('should return purchases for today successfully (200)', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });

        utils.getDateString.mockReturnValue('2025-08-14');
        mockQuery.mockResolvedValueOnce([{ purchase_id: 'P001' }]);
        getAllPurchaseHelper.createPurchaseWrapper.mockResolvedValueOnce([{ purchaseId: 'P001', total: 100 }]);

        const res = await request(app)
            .get('/')
            .set('x-storename','dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual([{ purchaseId: 'P001', total: 100 }]);
        expect(mockQuery).toHaveBeenCalledWith(Sql.get_all_purchase('2025-08-14'));
    });

    it('should return purchases for a given date successfully (200)', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });

        mockQuery.mockResolvedValueOnce([{ purchase_id: 'P002' }]);
        getAllPurchaseHelper.createPurchaseWrapper.mockResolvedValueOnce([{ purchaseId: 'P002', total: 200 }]);

        const res = await request(app)
            .get('/2025-08-01')
            .set('x-storename','dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual([{ purchaseId: 'P002', total: 200 }]);
        expect(mockQuery).toHaveBeenCalledWith(Sql.get_all_purchase('2025-08-01'));
    });

    it('should return 500 if database query fails', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });

        utils.getDateString.mockReturnValue('2025-08-14');
        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(app)
            .get('/')
            .set('x-storename','dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error' });
    });
});
