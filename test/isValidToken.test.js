const express = require("express");
const isValidToken = require("../src/routes/isValidToken");
const request = require("supertest");
const token = require("../src/internal/token");

const app = express();
app.use(express.json());
app.use('/', isValidToken);

describe('IsValidToken Route', () => {
    it('GET / Valid Token', async () => {
        const authToken = token.getToken("test_user");
        const response = await request(app).post('/').set('x-authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({"is_valid_user": true});
    });

    it('GET / InValid Token', async () => {
        const authToken = "abcdefghijklmnopqrstuvwxyz12345667890";
        const response = await request(app).post('/').set('x-authorization', `Bearer ${authToken}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toStrictEqual({"message": "Invalid Authorization Token"});
    });

    it('GET / Without Token', async () => {
        const response = await request(app).post('/');
        expect(response.statusCode).toBe(403);
        expect(response.body).toStrictEqual({"message": "Authorization Token Missing"});
    });
});