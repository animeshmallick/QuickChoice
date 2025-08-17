const express = require("express");
const getPurchaseID = require("../src/routes/getPurchaseID");
const request = require("supertest");
const token = require("../src/internal/token");

const app = express();
app.use(express.json());
app.use('/', getPurchaseID);

describe('GetPurchaseID Route', () => {
    it('GET / should return purchase id with valid authToken', async () => {

        const authToken = token.getToken("test_user");
        const response = await request(app).get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('purchaseID');
        expect(response.body.purchaseID.startsWith('PID-')).toBe(true);
    });

    it('GET / should not return purchase for invalid authToken', async () => {
        const authToken = "abcdefghijklmnopqrstuvwxyz12345667890";
        const response = await request(app).get('/')
            .set('x-storename', 'dummyStore')
            .set('x-authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toStrictEqual({"message": "Invalid Authorization Token"});
    });

    it('GET / should not return purchase id without authToken', async () => {
        const response = await request(app).get('/').set('x-storename', 'dummyStore');
        expect(response.statusCode).toBe(403);
        expect(response.body).toStrictEqual({"message": "Authorization Token Missing"});
    });
});