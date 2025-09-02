// __tests__/queueSize.test.js
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
    verifyAuthToken: jest.fn(),
    verifyAdminAuthToken: jest.fn()
}));

// Mock SQL
jest.mock('../src/resource/sql', () => ({
    get_all_purchase_status_for_today: jest.fn((custId) =>
        `SQL_get_status_today(${custId})`
    ),
    get_all_status_from_purchase: jest.fn(() =>
        `SQL_get_all_status_from_purchase()`
    )
}));

const request = require('supertest');
const express = require('express');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const queueSizeRouter = require('../src/routes/queueSize');

const app = express();
app.use(express.json());

// Fake middleware to attach customer_id
app.use((req, res, next) => {
    req.customer_id = 'cust-123';
    next();
});
app.use('/', queueSizeRouter);

describe('GET /queueSize (User)', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 401 if auth token verification fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ error: 'Unauthorized' });
        });

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: 'Unauthorized' });
    });

    it('should return 200 with queue status counts', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => next());
        mockQuery.mockResolvedValueOnce([
            { status: 'PENDING', counts: 2 },
            { status: 'COMPLETED', counts: 5 }
        ]);

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            PENDING: 2,
            COMPLETED: 5
        });
        expect(mockQuery).toHaveBeenCalledWith(
            Sql.get_all_purchase_status_for_today('cust-123')
        );
    });

    it('should return 500 if database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => next());
        mockQuery.mockRejectedValueOnce(new Error('DB error in queueSize'));

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error in queueSize' });
    });
});

describe('GET /queueSize/admin (Admin)', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 401 if admin auth token verification fails', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ error: 'Unauthorized' });
        });

        const res = await request(app)
            .get('/admin')
            .set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: 'Unauthorized' });
    });

    it('should return 200 with admin queue status counts', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res, next) => next());
        mockQuery.mockResolvedValueOnce([
            { status: 'PENDING', counts: 10 },
            { status: 'FAILED', counts: 1 }
        ]);

        const res = await request(app)
            .get('/admin')
            .set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            PENDING: 10,
            FAILED: 1
        });
        expect(mockQuery).toHaveBeenCalledWith(
            Sql.get_all_status_from_purchase()
        );
    });

    it('should return 500 if database query fails (admin)', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res, next) => next());
        mockQuery.mockRejectedValueOnce(new Error('DB error in admin queueSize'));

        const res = await request(app)
            .get('/admin')
            .set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error in admin queueSize' });
    });
});
