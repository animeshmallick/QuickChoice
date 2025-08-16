jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const testHelper = require("../src/helpers/TestHelper.js");
const database = require('../src/internal/database');
const productRouter = require("../src/routes/product");

const app = express();
app.use('/', productRouter);


describe('Product Route',() => {
    beforeEach(() => {
        // Reset mock calls before each test
        database.query.mockReset();
        database.end.mockReset();
    });

    it('GET /3 should return a product object for the productID:3', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.PRODUCT.name);
        database.query.mockImplementation(() => Promise.resolve([mockData]));

        const response = await request(app).get('/:productId');
        expect(response.status).toBe(200);
        expect(typeof response.body === 'object').toBe(true);
    })

    it('GET / should return an error if there is a database error', async () => {
        database.query.mockImplementation(() => Promise.reject(new Error('DB Error')));
        const response = await request(app).get('/:productId');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({'error': 'DB Error'});
    });

})