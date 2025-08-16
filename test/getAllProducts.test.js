jest.mock('../src/internal/database', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const express = require("express");
const getAllProducts = require("../src/routes/getAllProducts");
const database = require("../src/internal/database");
const request = require("supertest");
const testHelper = require("../src/helpers/TestHelper");

const app = express();
app.use(express.json());
app.use('/', getAllProducts);

describe('GetAllProducts Route', () => {
    beforeEach(() => ({
        query: jest.fn(),
        end: jest.fn()
    }));
    it('GET / should return products', async () => {
        const mockData = testHelper.get_sql_mock_data(testHelper.mock_data_key.ALL_PRODUCTS.name);
        database.query.mockImplementation(() => Promise.resolve(mockData));

        const response = await request(app).get('/');
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
        database.query.mockImplementation(() => Promise.reject(new Error("DB Error")));
        const response = await request(app).get('/');
        
        expect(response.statusCode).toBe(500);
        expect(response.body).toStrictEqual({error: "DB Error"});
    });
});