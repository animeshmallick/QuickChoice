const express = require("express");
const getPaymentMethod = require("../src/routes/getPaymentMethod");
const request = require("supertest");
const token = require("../src/internal/token");

const app = express();
app.use(express.json());
app.use('/', getPaymentMethod);

describe('GetPaymentMethod Route', () => {
    it('GET / should return payment method with valid authToken', async () => {

        const authToken = token.getToken("test_user");
        const response = await request(app).get('/').set('x-authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach(paymentMethod => {
            expect(paymentMethod).toHaveProperty("id");
            expect(paymentMethod).toHaveProperty("name");
        });
    });

    it('GET / should not return payment method for invalid authToken', async () => {
        const authToken = "abcdefghijklmnopqrstuvwxyz12345667890";
        const response = await request(app).get('/').set('x-authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toStrictEqual({"message": "Invalid Authorization Token"});
    });

    it('GET / should not return payment method without authToken', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(403);
        expect(response.body).toStrictEqual({"message": "Authorization Token Missing"});
    });
});