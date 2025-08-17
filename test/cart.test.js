const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

const request = require('supertest');
const express = require('express');
const testHelper = require("../src/helpers/TestHelper.js");
const cart = require("../src/routes/cart");

const app = express();
app.use(express.json());
app.use('/', cart);

describe('Cart Route', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    it('POST / should validate cart with 2 products', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.CART_WITH_PRODUCTS_2.name);
        mockQuery.mockImplementation(() => Promise.resolve(mockData));
        const response = await request(app).post('/')
            .set('x-storename','dummyStore')
            .send([
                {"ProductID": "2", "Quantity": 1},
                {"ProductID": "3", "Quantity": 2}
            ]);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('products');
        expect(response.body).toHaveProperty('bill');
    });
    it('POST / should validate cart with 1 products', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.CART_WITH_PRODUCTS_1.name);
        mockQuery.mockImplementation(() => Promise.resolve(mockData));
        const response = await request(app).post('/')
            .set('x-storename','dummyStore')
            .send([{"ProductID": "2", "Quantity": 1}]);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('products');
        expect(response.body).toHaveProperty('bill');
    });
    it('POST / should validate empty cart', async () => {
        const response = await request(app).post('/')
            .set('x-storename','dummyStore')
            .send([]);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: "Empty Cart"});
    });
    it('POST / should validate error in cart request body', async () => {
        const response = await request(app).post('/')
            .set('x-storename','dummyStore')
            .send([{"ProductId": "2", "Quantity": 1}, {"ProductId": "3", "Quantity": 2}]);
        expect(response.status).toBe(403);
        expect(response.body).toEqual({error: "Invalid Data in Cart Requests"});
    });
    it('POST / should return 403 if store name is missing', async () => {
        const response = await request(app).post('/')
            .send([
                {"ProductID": "2", "Quantity": 1},
                {"ProductID": "3", "Quantity": 2}
            ]);
        expect(response.status).toBe(403);
        expect(response.body).toStrictEqual({message: "Store name is missing"});

    })
});
