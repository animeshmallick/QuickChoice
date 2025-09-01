// __tests__/getStreakCount.test.js
const mockQuery = jest.fn();
const mockCalculateStreak = jest.fn();

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

// Mock SQL
jest.mock('../src/resource/sql', () => ({
    get_all_purchase_dates_for_customer: jest.fn((id) => `SQL_get_all_purchase_dates_for_customer(${id})`)
}));

// Mock streakCountHelper
jest.mock('../src/helpers/streakCountHelper', () => ({
    calculateStreak: jest.fn((dates) => mockCalculateStreak(dates))
}));

const request = require('supertest');
const express = require('express');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const { calculateStreak } = require('../src/helpers/streakCountHelper');
const getStreakRouter = require('../src/routes/getStreakCount');

const app = express();
app.use(express.json());

// Fake middleware to attach a customer_id for tests
app.use((req, res, next) => {
    req.customer_id = "cust-123";
    next();
});
app.use('/', getStreakRouter);

describe('GET /getStreakCount', () => {
    beforeEach(() => {
        mockQuery.mockReset();
        mockCalculateStreak.mockReset();
    });

    it('should return 401 if auth token verification fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ error: "Unauthorized" });
        });

        const res = await request(app).get('/').set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: "Unauthorized" });
    });

    it('should return streakCount = 0 when no purchase dates are found', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => next());
        mockQuery.mockResolvedValueOnce([]);

        const res = await request(app).get('/').set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ streakCount: 0 });
        expect(mockQuery).toHaveBeenCalledWith(
            Sql.get_all_purchase_dates_for_customer("cust-123")
        );
    });

    it('should return streakCount from calculateStreak when dates exist', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => next());
        const mockDates = [{ purchase_date: "2025-08-30" }, { purchase_date: "2025-08-31" }];
        mockQuery.mockResolvedValueOnce(mockDates);
        mockCalculateStreak.mockReturnValueOnce(5);

        const res = await request(app).get('/').set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ streakCount: 5 });
        expect(mockCalculateStreak).toHaveBeenCalledWith(["2025-08-30", "2025-08-31"]);
    });

    it('should return 500 when database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => next());
        mockQuery.mockRejectedValueOnce(new Error("DB error in getStreakCount"));

        const res = await request(app).get('/').set('x-storename', 'dummyStore');

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: "DB error in getStreakCount" });
    });
});
