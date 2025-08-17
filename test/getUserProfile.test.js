const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});
jest.mock('../src/internal/token', () => ({
    verifyAuthToken: jest.fn()
}));

jest.mock('../src/resource/sql', () => ({
    get_user_profile: jest.fn((id) => `SQL for ${id}`)
}));

const request = require('supertest');
const express = require('express');
const token = require('../src/internal/token');
const Sql = require('../src/resource/sql');
const getUserProfileRouter = require('../src/routes/getUserProfile');

const app = express();
app.use(express.json());
app.use('/', getUserProfileRouter);

describe('GET /getUserProfile', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('should return 401 if token verification fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res) => {
            res.status(401).json({ message: "Invalid Authorization Token" });
        });

        const res = await request(app).get('/').set('x-storename', 'dummyStore');
        expect(res.statusCode).toBe(401);
        expect(res.body).toStrictEqual({ message: "Invalid Authorization Token" });
    });

    it('should return 200 with user profile if successful', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER001';
            next();
        });

        mockQuery.mockResolvedValueOnce([{ fname: 'John', lname: 'Doe', phone: '+91 9876543210' }]);

        const res = await request(app)
            .get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', 'Bearer validtoken');

        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            fname: 'John',
            lname: 'Doe',
            phone: '+91 9876543210'
        });
        expect(mockQuery).toHaveBeenCalledWith(Sql.get_user_profile('USER001'));
    });

    it('should return 500 if database query fails', async () => {
        token.verifyAuthToken.mockImplementation((req, res, next) => {
            req.customer_id = 'USER002';
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
});
