jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const testHelper = require("../src/helpers/TestHelper.js");
const database = require('../src/internal/database');
const productsFromCategoryRouter = require("../src/routes/productsFromCategory");

const app = express();
app.use('/', productsFromCategoryRouter);

describe('Products From Category Route', () => {
    beforeEach(() => ({
        query: jest.fn(),
        end: jest.fn()
    }));

    it('GET /Dairy should return an array of products from the database grouped by category "Dairy"', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.PRODUCTS_FROM_CATEGORY.name);
        database.query.mockImplementation(() => Promise.resolve(mockData));

        const response = await request(app).get('/:category');
        console.log(response.body);
        expect(response.statusCode).toBe(200);
        expect(Object.keys(response.body).length > 0).toBe(true);
        expect(Array.isArray(response.body[Object.keys(response.body)[0]])).toBe(true);
    })

    it('GET / validate DB error', async () => {
        database.query.mockImplementation(() => Promise.reject(new Error("DB Error")));

        const response = await request(app).get('/:category');

        expect(response.statusCode).toBe(500);
    })

    it('GET /xyz database returns blank array', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.PRODUCTS_WHEN_CATEGORY_INVALID.name);
        database.query.mockImplementation(() => Promise.resolve(mockData));

        const response = await request(app).get('/:category');
        console.log(response.body);
        expect(response.statusCode).toBe(200);
        expect(Object.keys(response.body).length).toEqual(0);
    })

    it('GET / Invalid call to DB', async () => {
        const response = await request(app).get('/');
        
        expect(response.statusCode).toBe(404);
    })
})