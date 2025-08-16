jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));
jest.mock('../src/internal/token.js', () => ({
    getAdminToken: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const testHelper = require("../src/helpers/TestHelper.js");
const database = require('../src/internal/database');
const adminLogin = require("../src/routes/adminLogin");
const token = require("../src/internal/token");

const app = express();
app.use(express.json());
app.use('/', adminLogin);

describe('Admin Login Route', () => {
    const sampleLoginBody = {
        "phone": "9123456789",
        "password": "admin123"
    };
    const incompleteLoginBody = {
        "password": "admin123"
    }
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should login an admin successfully', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.ADMIN_LOGIN_SUCCESSFUL.name);
        const mockToken = "mock-admin-token";
        token.getAdminToken.mockReturnValue(mockToken);
        database.query.mockImplementation(() => Promise.resolve(mockData));

        const res = await request(app).post('/')
            .send(sampleLoginBody);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({ adminAuthToken: mockToken });
        expect(token.getAdminToken).toHaveBeenCalledTimes(1);
        expect(database.query).toHaveBeenCalledTimes(1);
    });
    it('should return 400 if phone or password is missing', async () => {
        const res = await request(app)
            .post('/')
            .send(incompleteLoginBody);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Invalid Login Details' });
        expect(database.query).not.toHaveBeenCalled();
    });
    it('should return 401 if not admin or invalid credentials', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.INVALID_ADMIN_LOGIN_CREDENTIALS.name);
        database.query.mockResolvedValueOnce(() => Promise.resolve(mockData));

        const res = await request(app)
            .post('/')
            .send(sampleLoginBody);

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            error: `No Admin User Details Found for phone ${sampleLoginBody.phone} and password ${sampleLoginBody.password}`
        });
    });

    it('should return 500 if database query fails', async () => {
        database.query.mockRejectedValueOnce(new Error('DB connection failed'));

        const res = await request(app)
            .post('/')
            .send(sampleLoginBody);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'DB connection failed' });
    });
})