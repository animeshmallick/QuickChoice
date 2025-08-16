jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const express = require("express");
const address = require("../src/routes/getAddress");
const database = require("../src/internal/database");
const request = require("supertest");
const testHelper = require("../src/helpers/TestHelper");
const token = require("../src/internal/token");

const app = express();
app.use(express.json());
app.use('/', address);

describe('Address Route', () => {
    beforeEach(() => {
        // Reset mock calls before each test
        database.query.mockReset();
        database.end.mockReset();
    });

    it('GET / should not return address without authToken', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(403);
        expect(response.body).toStrictEqual({ message: "Authorization Token Missing" });
    });

    it('GET / should return address with authToken of user without saved address', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.NO_ADDRESS_FOUND.name);
        database.query.mockImplementation(() => Promise.resolve(mockData));

        const authToken = token.getToken("test_user");
        const response = await request(app).get('/').set('x-authorization', `Bearer ${authToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("storeAddress");
        expect(response.body).toHaveProperty("userAddress");
        expect(response.body.userAddress.length).toBe(0);
    });

    it('GET / should return address with authToken of user with saved address', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.ADDRESS_FOUND.name);
        database.query.mockImplementation(() => Promise.resolve(mockData));

        const authToken = token.getToken("USR001");
        const response = await request(app).get('/').set('x-authorization', `Bearer ${authToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("storeAddress");
        expect(response.body).toHaveProperty("userAddress");
        expect(response.body.userAddress.length).toBeGreaterThan(0);
        response.body.userAddress.forEach(addr => {
            expect(addr).toHaveProperty("address_id");
        });
    });

    it('GET / should return an error if there is a database error', async () => {
        database.query.mockImplementation(() => Promise.reject(new Error('DB Error')));

        const authToken = token.getToken("test_user");
        const response = await request(app).get('/').set('x-authorization', `Bearer ${authToken}`);

        expect(response.statusCode).toBe(500);
        expect(response.body).toStrictEqual({ error: "DB Error" });
    });
});
