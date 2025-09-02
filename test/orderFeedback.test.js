// __tests__/orderFeedback.test.js
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

// Mock SQL
jest.mock('../src/resource/sql', () => ({
    update_feedback_for_purchase_id: jest.fn((id, rating, exp) =>
        `SQL_update_feedback(${id},${rating},${exp})`
    )
}));

const request = require('supertest');
const express = require('express');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const orderFeedbackRouter = require('../src/routes/orderFeedback');

const app = express();
app.use(express.json());

// Fake middleware to attach customer_id
app.use((req, res, next) => {
    req.customer_id = 'cust-123';
    next();
});
app.use('/', orderFeedbackRouter);

describe('POST /orderFeedback', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 401 if auth token verification fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ error: 'Unauthorized' });
        });

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send({ purchase_id: '1', order_rating: 4, app_experience: 5 });

        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ error: 'Unauthorized' });
    });

    it('should return 400 if parameters are missing', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => next());

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send({ order_rating: 4 }); // missing purchase_id & app_experience

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
            status: false,
            message: 'Invalid parameters'
        });
    });

    it('should return 400 if order_rating is out of range', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => next());

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send({ purchase_id: '1', order_rating: 10, app_experience: 4 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
            status: false,
            message: 'Invalid parameters'
        });
    });

    it('should return 400 if app_experience is out of range', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => next());

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send({ purchase_id: '1', order_rating: 4, app_experience: -1 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
            status: false,
            message: 'Invalid parameters'
        });
    });

    it('should return 200 if feedback is updated successfully', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => next());
        mockQuery.mockResolvedValueOnce(true);

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send({ purchase_id: '1', order_rating: 4, app_experience: 5 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            status: true,
            message: 'App experience and delivery feedback updated successfully'
        });
        expect(mockQuery).toHaveBeenCalledWith(
            Sql.update_feedback_for_purchase_id('1', 4, 5)
        );
    });

    it('should return 500 if database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => next());
        mockQuery.mockRejectedValueOnce(new Error('DB error in orderFeedback'));

        const res = await request(app)
            .post('/')
            .set('x-storename', 'dummyStore')
            .send({ purchase_id: '1', order_rating: 4, app_experience: 5 });

        expect(res.statusCode).toBe(500);
        expect(res.body).toStrictEqual({ error: 'DB error in orderFeedback' });
    });
});
