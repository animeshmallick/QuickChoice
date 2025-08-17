const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

jest.mock('../src/internal/token', () => ({
    verifyAdminAuthToken: jest.fn()
}));

jest.mock('../src/helpers/changePurchaseStatusHelper', () => ({
    isStatusChangeAllowed: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const Token = require('../src/internal/token');
const statusHelper = require('../src/helpers/changePurchaseStatusHelper');
const changePurchaseStatus = require('../src/routes/changePurchaseStatus');

const app = express();
app.use(express.json());
app.use('/', changePurchaseStatus);

describe('Change Purchase Status Route', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 403 if no auth token provided', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res) => {
            res.status(403).json({ message: "Authorization Token Missing" });
        });

        const res = await request(app).post('/PURCH123/CONFIRMED').set('x-storename','dummyStore');
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual({ message: "Authorization Token Missing" });
    });

    it('should return 401 if invalid admin token', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ message: "Invalid Authorization Token" });
        });

        const res = await request(app)
            .post('/PURCH123/CONFIRMED')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer badtoken');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ message: "Invalid Authorization Token" });
    });

    it('should return 404 if purchase not found', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });

        mockQuery.mockResolvedValueOnce([]); // No purchase found

        const res = await request(app)
            .post('/PURCH999/CONFIRMED')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(404);
        expect(res.body).toStrictEqual({ error: "Invalid Purchase Id" });
    });

    it('should return 400 if status change is not allowed', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });

        mockQuery.mockResolvedValueOnce([{ status: 'PLACED' }]);
        statusHelper.isStatusChangeAllowed.mockReturnValue(false);

        const res = await request(app)
            .post('/PURCH123/DELIVERED_WITH_PAYMENT_SUCCESS')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
            error: "Status Change Not Allowed from [PLACED] to [DELIVERED_WITH_PAYMENT_SUCCESS]"
        });
    });

    it('should change status successfully (200)', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });

        mockQuery
            .mockResolvedValueOnce([{ status: 'PLACED' }]) // First query: current status
            .mockResolvedValueOnce({ affectedRows: 1 });    // Second query: update success

        statusHelper.isStatusChangeAllowed.mockReturnValue(true);

        const res = await request(app)
            .post('/PURCH123/CONFIRMED')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            success: "Status Change Success from [PLACED] to [CONFIRMED]"
        });
        expect(mockQuery).toHaveBeenCalledTimes(2);
    });

});
