// __tests__/deleteHappyHour.test.js
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
    delete_happy_hours: jest.fn(() => 'SQL delete happy hours')
}));

const request = require('supertest');
const express = require('express');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const deleteHappyHourRouter = require('../src/routes/deleteHappyHour');

const app = express();
app.use(express.json());
app.use('/', deleteHappyHourRouter);

describe('GET /deleteHappyHour', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 401 if admin token verification fails', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ error: "Unauthorized" });
        });

        const res = await request(app).get('/').set('x-storename', 'dummyStore');
        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: "Unauthorized" });
    });

    it('should return 200 if happy hours deleted successfully', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER123';
            next();
        });

        mockQuery.mockResolvedValueOnce(true);

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer adminToken');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            status: true,
            message: "Happy hours deleted successfully"
        });
        expect(mockQuery).toHaveBeenCalledWith(Sql.delete_happy_hours());
    });

    it('should return 500 if database query throws an error', async () => {
        token.verifyAdminAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER123';
            next();
        });

        mockQuery.mockRejectedValueOnce(new Error('DB deletion error'));

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer adminToken');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB deletion error' });
    });
});
