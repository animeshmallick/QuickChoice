jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));
jest.mock('../src/helpers/userRegistrationHelper.js', () => ({
    isNewUser: jest.fn((req, res, next) => {
        if(typeof next === "function")
            return next();
    }),
    createUserId: jest.fn((req, res, next) => {
        req.userid = 'USR123456';
        if(typeof next === "function")
            return next();
    }),
}));
jest.mock('../src/internal/token.js', () => ({
    getToken: jest.fn(),
}));


const request = require('supertest');
const express = require('express');
const testHelper = require("../src/helpers/TestHelper.js");
const database = require('../src/internal/database');
const userRegistration = require("../src/routes/userRegistration");
const UserRegistrationHelper = require("../src/helpers/userRegistrationHelper");
const token = require("../src/internal/token");

const app = express();
app.use(express.json());
app.use('/', userRegistration);

describe('User Registration Route', () => {
    beforeEach(() => {
        database.query.mockReset();
        database.end.mockReset();
    });
    const sampleData = {
        "fname": "John",
        "lname": "Doe",
        "phone": "9876543210",
        "password": "mysecurepassword",
        "email": "john.doe@example.com"
    };
    const incompleteSampleData = {
        "lname": "Doe",
        "phone": "9876543210",
        "password": "mysecurepassword",
        "email": "john.doe@example.com"
    };
    it('POST / should register a user successfully', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.USER_REGISTERED_SUCCESSFULLY.name)
        const mockToken = 'mock-jwt-token';
        token.getToken.mockReturnValue(mockToken);

        database.query.mockImplementation(() => Promise.resolve(mockData));

        const res = await request(app).post('/')
            .send(sampleData);

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual(mockData);
        expect(UserRegistrationHelper.isNewUser).toBeCalledTimes(1);
        expect(UserRegistrationHelper.createUserId).toBeCalledTimes(1);
    });

    it('POST / should return 400 if required fields are missing', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.INVALID_USER_REGISTRATION_DETAILS.name);
        const res = await request(app).post('/')
            .send(incompleteSampleData);

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual(mockData);
        expect(database.query).not.toHaveBeenCalled();
    });
});