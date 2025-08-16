jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const testHelper = require("../src/helpers/TestHelper.js");
const database = require('../src/internal/database');
const similarProductsRouter = require("../src/routes/similarProducts");

const app = express();
app.use('/', similarProductsRouter);

//ToDo: Complete the tests

describe('Similar Products Route',() => {
    beforeEach(() => ({
        query: jest.fn(),
        end: jest.fn()
    }));

     it('GET /3 should return an array with products similar to productID:3', async () => {
         const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.SIMILAR_PRODUCTS.name);
         database.query.mockImplementation(() => Promise.resolve(mockData));

         const response = await request(app).get('/3');
         expect(response.status).toBe(200);
         expect(response.body.length).toBeGreaterThan(0);
         response.body.forEach((item) => {
             expect(item.productId).not.toBe(null);
         })
     });

     it('GET /xyz should return a blank array', async () => {
         const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.INVALID_PRODUCT.name);
         database.query.mockImplementation(() => Promise.resolve(mockData));

         const response = await request(app).get('/9999');
         expect(response.status).toBe(400);
         expect(response.body.hasOwnProperty('error')).toBe(true);
     });
})