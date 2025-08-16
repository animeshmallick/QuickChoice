jest.mock('../src/internal/token', () => ({
    getToken: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const token = require("../src/internal/token");
const getAuthToken = require("../src/routes/getAuthToken");

const app = express();
app.use(express.json());
app.use('/', getAuthToken);

describe('Get AuthToken Route', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a guest auth token with status 200', async () => {
        const mockToken = 'mock-guest-token';
        token.getToken.mockReturnValue(mockToken);

        const res = await request(app).get('/');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ auth_token: mockToken });
        expect(token.getToken).toHaveBeenCalledWith('GUEST');
        expect(token.getToken).toHaveBeenCalledTimes(1);
    });
})