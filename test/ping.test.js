const request = require('supertest');
const express = require('express');
const pingTest = require('../src/routes/ping');
const testHelper = require("../src/helpers/TestHelper.js");
const token = require("../src/internal/token");

const app = express();
app.use('/', pingTest);

describe('Ping Router', () => {
    it('GET / Call to Ping Router', async () => {
        const res = await request(app).get('/');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toStrictEqual({"message": "Ping From Backend Server"});
    });
    it('POST / Call to Ping Router with AuthToken', async () => {
        const authToken = token.getAdminToken("test_user");
        const res = await request(app).post('/').set('x-authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toStrictEqual({"message": "Ping From Backend Server", "user": "test_user"});
    });

    it('POST / Call to Ping Router without authToken', async () => {
        const res = await request(app).post('/');

        expect(res.statusCode).toEqual(403);
        expect(res.body).toStrictEqual({"message": "Admin Authorization Token Missing"});
    });
});
