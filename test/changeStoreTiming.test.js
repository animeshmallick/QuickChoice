jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

jest.mock('../src/internal/token', () => ({
    verifyAdminAuthToken: jest.fn()
}));

jest.mock('../src/helpers/StoreTimingHelper', () => ({
    validateReqParams: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const database = require('../src/internal/database');
const Token = require('../src/internal/token');
const StoreTimingHelper = require('../src/helpers/StoreTimingHelper');
const changeStoreTiming = require('../src/routes/changeStoreTiming');

const app = express();
app.use(express.json());
app.use('/', changeStoreTiming);

describe('Change Store Timing Route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if no auth token provided', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res) => {
            res.status(403).json({ message: "Authorization Token Missing" });
        });

        const res = await request(app).post('/');
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual({ message: "Authorization Token Missing" });
    });
    it('should return 401 if invalid admin token', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ message: "Invalid Authorization Token" });
        });

        const res = await request(app)
            .post('/')
            .set('x-authorization', 'Bearer badtoken');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ message: "Invalid Authorization Token" });
    });

    it('should return 400 if missing required params', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });
        StoreTimingHelper.validateReqParams.mockImplementation((req, res, next) => next());

        const res = await request(app)
            .post('/')
            .set('x-authorization', 'Bearer validtoken')
            .send({ open_time: '09:00:00' }); // Missing close_time
        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({ success: false, message: "Invalid parameters" });
        expect(database.query).not.toHaveBeenCalled();
    });

    it('should change store timings successfully (200)', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });
        StoreTimingHelper.validateReqParams.mockImplementation((req, res, next) => next());
        database.query.mockResolvedValueOnce({ affectedRows: 1 });

        const res = await request(app)
            .post('/')
            .set('x-authorization', 'Bearer validtoken')
            .send({ open_time: '09:00:00', close_time: '21:00:00' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ success: true, message: "Store timings changed successfully" });
        expect(database.query).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if database query fails', async () => {
        Token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.admin_user_id = 'ADMIN001';
            next();
        });
        StoreTimingHelper.validateReqParams.mockImplementation((req, res, next) => next());
        database.query.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(app)
            .post('/')
            .set('x-authorization', 'Bearer validtoken')
            .send({ open_time: '09:00:00', close_time: '21:00:00' });

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ success: false, message: 'DB error' });
    });
});

