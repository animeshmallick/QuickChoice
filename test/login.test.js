const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});
const express = require("express");
const login = require("../src/routes/login");
const request = require("supertest");
const testHelper = require("../src/helpers/TestHelper");


const app = express();
app.use(express.json());
app.use('/', login);

describe('Login Route', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });
    it('GET / should return auth token on successfully login', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.LOGIN.name);
        mockQuery.mockImplementation(() => Promise.resolve(mockData));

        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .send({"phone": 1234567890, "password": "admin@2"});
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('authToken');
        expect(response.body.authToken).not.toBe(null);
    });

    it('GET / should not return auth token with invalid user', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.NO_USERS_FOUND.name);
        mockQuery.mockImplementation(() => Promise.resolve(mockData));

        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .send({"phone": 1234567890, "password": "test"});
        expect(response.statusCode).toBe(401);
        expect(response.body.error.startsWith("No User Details Found")).toBe(true);
    });

    it('GET / should not return auth token when phone missing', async () => {
        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .send({"password": "test"});
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({error: "Invalid Login Details"});
    });

    it('GET / should not return auth token when password missing', async () => {
        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .send({"phone": 1234567890});
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({error: "Invalid Login Details"});
    });

    it('GET / should not return auth token when password missing', async () => {
        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .send({});
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({error: "Invalid Login Details"});
    });
    it('GET / should not return auth token when password missing', async () => {
        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .set('Content-Type', 'application/json')
            .send();
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({error: "Invalid Login Details"});
    });
    it('GET / should return an error if there is a database error', async () => {
        mockQuery.mockImplementation(() => Promise.reject(new Error('DB Error')));
        const response = await request(app).post('/')
            .set('x-storename', 'dummyStore')
            .set('Content-Type', 'application/json')
            .send({"phone": 1234567890, "password": "test"});
        expect(response.statusCode).toBe(500);
    });
});