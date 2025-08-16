jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const express = require("express");
const login = require("../src/routes/login");
const database = require("../src/internal/database");
const request = require("supertest");
const testHelper = require("../src/helpers/TestHelper");


const app = express();
app.use(express.json());
app.use('/', login);

describe('Login Route', () => {
    beforeEach(() => {
        database.query.mockReset();
        database.end.mockReset();
    });
    it('GET / should return auth token on successfully login', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.LOGIN.name);
        database.query.mockImplementation(() => Promise.resolve(mockData));

        const response = await request(app).post('/')
            .set('Content-Type', 'application/json')
            .send({"phone": 1234567890, "password": "admin@2"});
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('authToken');
        expect(response.body.authToken).not.toBe(null);
    });

    it('GET / should not return auth token with invalid user', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.NO_USERS_FOUND.name);
        database.query.mockImplementation(() => Promise.resolve(mockData));

        const response = await request(app).post('/')
            .set('Content-Type', 'application/json')
            .send({"phone": 1234567890, "password": "test"});
        expect(response.statusCode).toBe(401);
        expect(response.body.error.startsWith("No User Details Found")).toBe(true);
    });

    it('GET / should not return auth token when phone missing', async () => {
        const response = await request(app).post('/')
            .set('Content-Type', 'application/json')
            .send({"password": "test"});
        console.log(response.body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({error: "Invalid Login Details"});
    });

    it('GET / should not return auth token when password missing', async () => {
        const response = await request(app).post('/')
            .set('Content-Type', 'application/json')
            .send({"phone": 1234567890});
        console.log(response.body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({error: "Invalid Login Details"});
    });

    it('GET / should not return auth token when password missing', async () => {
        const response = await request(app).post('/')
            .set('Content-Type', 'application/json')
            .send({});
        console.log(response.body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({error: "Invalid Login Details"});
    });
    it('GET / should not return auth token when password missing', async () => {
        const response = await request(app).post('/')
            .set('Content-Type', 'application/json')
            .send();
        console.log(response.body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({error: "Invalid Login Details"});
    });
    it('GET / should return an error if there is a database error', async () => {
        database.query.mockImplementation(() => Promise.reject(new Error('DB Error')));
        const response = await request(app).post('/')
            .set('Content-Type', 'application/json')
            .send({"phone": 1234567890, "password": "test"});
        expect(response.statusCode).toBe(500);
    });
});