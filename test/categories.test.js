const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

const request = require('supertest');
const express = require('express');
const testHelper = require("../src/helpers/TestHelper.js");
const categoriesRouter = require("../src/routes/categories");

const app = express();
app.use('/', categoriesRouter);

describe('Categories Route', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('GET / should return all categories grouped correctly', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.CATEGORIES.name);
        mockQuery.mockImplementation(() => Promise.resolve(mockData));
        const response = await request(app).get('/').set('x-storename','dummyStore');

        expect(response.statusCode).toBe(200);
        expect(Object.keys(response.body).length > 0).toBe(true);
        expect(Array.isArray(response.body[Object.keys(response.body)[0]])).toBe(true);
    });
    it('GET / should return an error if there is a database error', async () => {
        mockQuery.mockImplementation(() => Promise.reject(new Error('DB Error')));
        const response = await request(app).get('/').set('x-storename','dummyStore');

        expect(response.statusCode).toBe(500);
    });
    it('GET / should return 403 if store name is missing', async () => {
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({ message: "Store name is missing" });
    })
});
