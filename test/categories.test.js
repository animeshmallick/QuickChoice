jest.mock('../src/internal/database', () => ({
        query: jest.fn(),
        end: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const testHelper = require("../src/helpers/TestHelper.js");
const database = require('../src/internal/database');
const categoriesRouter = require("../src/routes/categories");

const app = express();
app.use('/', categoriesRouter);

describe('Categories Route', () => {
    beforeEach(() => ({
        query: jest.fn(),
        end: jest.fn()
    }));

    it('GET / should return all categories grouped correctly', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.CATEGORIES.name);
        database.query.mockImplementation(() => Promise.resolve(mockData));
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(200);
        expect(Object.keys(response.body).length > 0).toBe(true);
        expect(Array.isArray(response.body[Object.keys(response.body)[0]])).toBe(true);
    });
    it('GET / should return an error if there is a database error', async () => {
        database.query.mockImplementation(() => Promise.reject(new Error('DB Error')));
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(500);
    });
});
