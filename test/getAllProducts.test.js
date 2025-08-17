const mockQuery = jest.fn();
jest.mock('../src/internal/database', () =>{
    return jest.fn().mockImplementation(() => {
        return { query: mockQuery };
    });
});

const express = require("express");
const getAllProducts = require("../src/routes/getAllProducts");
const request = require("supertest");
const testHelper = require("../src/helpers/TestHelper");

const app = express();
app.use(express.json());
app.use('/', getAllProducts);

describe('GetAllProducts Route', () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });
    it('GET / should return products', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.ALL_PRODUCTS.name);
        mockQuery.mockImplementation(() => Promise.resolve(mockData));

        const response = await request(app).get('/').set('x-storename','dummyStore');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach(product => {
            expect(product).toHaveProperty("id");
            expect(product).toHaveProperty("name");
            expect(product).toHaveProperty("category");
            expect(product).toHaveProperty("category_header");
            expect(product).toHaveProperty("subcategory");
            expect(product).toHaveProperty("mrp");
            expect(product).toHaveProperty("selling_price");
            expect(product).toHaveProperty("stock");
            expect(product).toHaveProperty("description");
            expect(product).toHaveProperty("image_url");
        });
    });

    it('GET / should return an error if there is a database error', async () => {
        mockQuery.mockImplementation(() => Promise.reject(new Error("DB Error")));
        const response = await request(app).get('/').set('x-storename','dummyStore');
        
        expect(response.statusCode).toBe(500);
        expect(response.body).toStrictEqual({error: "DB Error"});
    });
});